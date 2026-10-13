import Foundation
import Vision
import ImageIO

// Usage: swift detect-faces.swift <image>
// Prints JSON: {"width":W,"height":H,"faces":[{"x":..,"y":..,"w":..,"h":..,"confidence":..}]} in top-left pixel coords.
let path = CommandLine.arguments[1]
let url = URL(fileURLWithPath: path)
guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
  FileHandle.standardError.write("cannot read \(path)\n".data(using: .utf8)!)
  exit(1)
}
let w = Double(image.width), h = Double(image.height)
// Small faces in large photos are missed at full-frame scale, so scan overlapping tiles too.
var faces: [[String: Double]] = []
func detect(_ img: CGImage, offsetX: Double, offsetY: Double) throws {
  let tw = Double(img.width), th = Double(img.height)
  let request = VNDetectFaceRectanglesRequest()
  request.revision = VNDetectFaceRectanglesRequestRevision3
  try VNImageRequestHandler(cgImage: img, options: [:]).perform([request])
  for obs in request.results ?? [] {
    let b = obs.boundingBox
    let face: [String: Double] = [
      "x": (offsetX + b.minX * tw).rounded(),
      "y": (offsetY + (1 - b.maxY) * th).rounded(),
      "w": (b.width * tw).rounded(),
      "h": (b.height * th).rounded(),
      "confidence": Double(obs.confidence),
    ]
    // Drop duplicates from overlapping tiles (centre within an existing box).
    let cx = face["x"]! + face["w"]! / 2, cy = face["y"]! + face["h"]! / 2
    let dup = faces.contains { f in cx > f["x"]! && cx < f["x"]! + f["w"]! && cy > f["y"]! && cy < f["y"]! + f["h"]! }
    if !dup { faces.append(face) }
  }
}
try detect(image, offsetX: 0, offsetY: 0)
let tile = 1400.0, step = 1000.0
var ty = 0.0
while ty < h {
  var tx = 0.0
  while tx < w {
    let rect = CGRect(x: tx, y: ty, width: min(tile, w - tx), height: min(tile, h - ty))
    if rect.width > 200 && rect.height > 200, let crop = image.cropping(to: rect) {
      try detect(crop, offsetX: tx, offsetY: ty)
    }
    tx += step
  }
  ty += step
}
let out: [String: Any] = ["width": w, "height": h, "faces": faces]
let data = try JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
print(String(data: data, encoding: .utf8)!)
