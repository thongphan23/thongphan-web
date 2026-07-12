import { handleBrain2SignupRequest } from '../../workers/brain2-campaign'

type SignupEnv = Parameters<typeof handleBrain2SignupRequest>[1]

export async function onRequestPost(context: { request: Request; env: SignupEnv }): Promise<Response> {
  return handleBrain2SignupRequest(context.request, context.env)
}

export async function onRequestOptions(context: { request: Request; env: SignupEnv }): Promise<Response> {
  return handleBrain2SignupRequest(context.request, context.env)
}
