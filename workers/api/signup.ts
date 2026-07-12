import { handleBrain2SignupRequest } from '../brain2-campaign'

export default {
  async fetch(request: Request, env: Parameters<typeof handleBrain2SignupRequest>[1]): Promise<Response> {
    return handleBrain2SignupRequest(request, env)
  },
}
