import Foundation
import Vision
import ImageIO
import CoreImage
import UniformTypeIdentifiers

// Usage: swift person-mask.swift <image> <out-mask.png>
// Writes a full-resolution grayscale mask of the largest person instance (the speaker).
let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1])
guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else { exit(1) }
let request = VNGeneratePersonInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: image, options: [:])
try handler.perform([request])
guard let obs = request.results?.first else { print("no people"); exit(2) }
var best: (Int, Int) = (0, 0)
for idx in obs.allInstances {
  let buf = try obs.generateMask(forInstances: IndexSet(integer: idx))
  CVPixelBufferLockBaseAddress(buf, .readOnly)
  let w = CVPixelBufferGetWidth(buf), h = CVPixelBufferGetHeight(buf), row = CVPixelBufferGetBytesPerRow(buf)
  let base = CVPixelBufferGetBaseAddress(buf)!.assumingMemoryBound(to: Float32.self)
  var count = 0
  for y in stride(from: 0, to: h, by: 2) { for x in stride(from: 0, to: w, by: 2) { if base[y * row / 4 + x] > 0.5 { count += 1 } } }
  CVPixelBufferUnlockBaseAddress(buf, .readOnly)
  print("instance \(idx) area \(count)")
  if count > best.1 { best = (idx, count) }
}
let scaled = try obs.generateScaledMaskForImage(forInstances: IndexSet(integer: best.0), from: handler)
let ci = CIImage(cvPixelBuffer: scaled)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: ci, to: URL(fileURLWithPath: args[2]), format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
print("kept instance \(best.0)")
