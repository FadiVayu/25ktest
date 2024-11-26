import { Controller, Route, Get } from 'tsoa'

@Route('/health')
export class HealthController extends Controller {
    @Get('/')
    public async health(): Promise<string> {
        return 'OK'
    }
}