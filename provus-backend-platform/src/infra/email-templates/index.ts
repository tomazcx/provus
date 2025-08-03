import { EmailTemplatesProvider } from 'src/data/protocols/email-templates';
import mjml2html = require('mjml');
import { recoverPasswordTemplate } from './templates';

export class EmailTemplatesImpl implements EmailTemplatesProvider {
  recoverPassword(hash: string): string {
    const { html } = mjml2html(recoverPasswordTemplate(hash));

    return html;
  }
}
