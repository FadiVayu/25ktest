import { Express } from 'express';
import redoc from 'redoc-express';

export class Redoc {
  private static get config() {
    return {
      theme: {
        colors: {
          primary: {
            main: '#458FFF',
            contrastText: '#FFFFFF',
          },
        },
        logo: {
          url: 'https://picsum.photos/200',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          lineHeight: '1.5',
          code: {
            code: '#87E8C7',
            backgroundColor: '#4D4D4E'
          }
        },
        sidebar: {
          backgroundColor: '#0D1B28',
          textColor: '#FFFFFF',
        }
      }
    }

  }

  public static init(app: Express) {
    app.get('/swagger.json', (req, res) => {
      res.sendFile('./public/swagger.json', { root: '.' });
    });

    app.get(
      '/docs',
      redoc({
        title: 'API Docs',
        specUrl: 'swagger.json',
        redocOptions: this.config
      })
    );
  }
}