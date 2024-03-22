import prompts, { Choice } from 'prompts';
import chalk, { ChalkInstance } from 'chalk';
import fs from 'fs';
import path from 'path';

type Variant = Choice & {
  title: string
  color: ChalkInstance
  value: string
}

type Framework = Choice & {
  title: string
  color: ChalkInstance
  variants: Variant[]
}

const FRAMEWORKS: Framework[] = [
  {
    title: 'Simple',
    color: chalk.yellow,
    description: 'simple bookmarklet template',
    variants: [
      {
        title: 'TypeScript',
        color: chalk.blue,
        value: 'template-simple-ts'
      },
      {
        title: 'JavaScript',
        color: chalk.yellow,
        value: 'template-simple'
      }
    ]
  },
  {
    title: 'Vue',
    color: chalk.green,
    description: 'vue bookmarklet template',
    variants: [
      {
        title: 'TypeScript',
        color: chalk.blue,
        value: 'template-vue-ts'
      },
      {
        title: 'JavaScript',
        color: chalk.yellow,
        value: 'template-vue'
      }
    ]
  }, {
    title: 'React',
    description: 'react bookmarklet template',
    color: chalk.blue,
    variants: [
      {
        title: 'TypeScript',
        color: chalk.blue,
        value: 'template-react-ts'
      },
      {
        title: 'JavaScript',
        color: chalk.yellow,
        value: 'template-react'
      }
    ]
  }
];

interface Options {
  projectName: string
  packageName: string
  framework: Framework[]
  variant: string
}

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore'
};

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

function parserUserAgent(userAgent: string | undefined) {
  if (!userAgent) {
    return undefined;
  }
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    // 版本
    // version: pkgSpecArr[1]
  };
}

async function init() {
  const options = <Options>await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: chalk.green('Project name:'),
      initial: 'bookmark-script-project',
      validate: (dir) => !fs.existsSync(dir) || isEmpty(dir) || `Target directory "${dir}" is not empty`
    },
    {
      type: (name) => isValidPackageName(name) ? null : 'text',
      name: 'packageName',
      message: chalk.green('Package name:'),
      initial: (name) => toValidPackageName(name),
      validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name',
    },
    {
      type: 'select',
      name: 'framework',
      message: chalk.green('Select a framework:'),
      choices: FRAMEWORKS.map(f => ({
        ...f,
        title: f.color(f.title),
        value: f.variants
      }))
    },
    {
      type: 'select',
      name: 'variant',
      message: chalk.green('Select a variant:'),
      choices: (variants: Variant[]) => {
        return variants.map(v => ({
          ...v,
          title: v.color(v.title),
        }));
      }
    },
  ]);
  const { projectName, packageName, variant } = options;

  if (variant == undefined) {
    console.log(chalk.yellow('\nCancel init'));
    return;
  }

  const cwd = process.cwd();
  const root = path.resolve(cwd, projectName);
  const template = path.resolve(import.meta.dirname, '../', variant);
  const userAgent = parserUserAgent(process.env.npm_config_user_agent);

  function copy(file: string, ctx?: string) {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (ctx) {
      fs.writeFileSync(targetPath, ctx, 'utf-8');
    } else {
      fs.cpSync(path.join(template, file), targetPath, { recursive: true, });
    }
  }

  // 拷贝模板
  fs.readdirSync(template)
    .filter(f => ![
      'package.json',
      'node_modules',
      'dist'
    ].includes(f))
    .forEach(f => copy(f));

  // 更改package.json
  const pkg = JSON.parse(fs.readFileSync(path.resolve(template, 'package.json'), 'utf-8'));
  pkg.name = packageName || toValidPackageName(projectName);
  delete pkg['private'];
  copy('package.json', JSON.stringify(pkg, undefined, 2));

  // 提示信息
  console.log('\nDone. Now run:\n');

  const cd = path.relative(cwd, root);

  if (projectName != '.') {
    console.log(`  cd ${cd}`);
  }

  const userAgentName = userAgent ? userAgent.name : 'npm';
  switch (userAgentName) {
    case 'yarn':
      console.log('  yarn');
      console.log('  yarn build');
      break;
    default:
      console.log(`  ${userAgentName} install`);
      console.log(`  ${userAgentName} run build`);
      break;
  }
}

init().catch(console.error);