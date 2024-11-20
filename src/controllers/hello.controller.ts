import { Controller, Route, Get } from 'tsoa'

@Route('/')
export class HelloController extends Controller {
    @Get('/hello')
    public async hello(): Promise<string> {
        return 'Hello, World!'
    }
}