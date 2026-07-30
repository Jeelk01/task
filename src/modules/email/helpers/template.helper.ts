import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';

export function compilePartialTemplate(
  bodyPath: string,
  layoutPath: string,
  context: any,
) {
  const layout = fs.readFileSync(layoutPath, 'utf8');
  const body = fs.readFileSync(bodyPath, 'utf8');

  // Insert body into layout
  const combined = layout.replace('{{{body}}}', body);

  // Replace variables like {{name}}
  const withContext = combined.replace(
    /{{(.*?)}}/g,
    (_, key) => context[key.trim()] ?? '',
  );

  const { html, errors } = mjml2html(withContext);

  if (errors?.length) {
    console.error(errors);
  }

  return html;
}
