import { Controller, Route, Get, Tags } from 'tsoa'

@Route('/health')
@Tags('Health')
export class HealthController extends Controller {
    @Get('/')
    public async health(): Promise<string> {
        return 'OK'
    }
}