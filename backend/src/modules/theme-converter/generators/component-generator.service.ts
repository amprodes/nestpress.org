import { Injectable, Logger } from '@nestjs/common';
import { ParsedPattern } from '../interfaces/converter.interfaces';
import { BlockTransformerService } from '../transformers/block-transformer.service';
import * as prettier from 'prettier';

/**
 * Component Generator Service
 * Generates React components from patterns
 */
@Injectable()
export class ComponentGeneratorService {
  private readonly logger = new Logger(ComponentGeneratorService.name);

  constructor(private readonly blockTransformer: BlockTransformerService) {}

  /**
   * Generate a React component from a pattern
   */
  async generatePatternComponent(pattern: ParsedPattern): Promise<string> {
    const componentName = this.patternSlugToComponentName(pattern.slug);
    const imports = new Set<string>(['React']);
    const warnings: string[] = [];

    // Transform all blocks
    const jsx = pattern.blocks
      .map(block => {
        const result = this.blockTransformer.transformBlock(block);
        result.imports.forEach(imp => imports.add(imp));
        warnings.push(...result.warnings);
        return result.jsx;
      })
      .join('\n  ');

    // Detect props used in JSX (siteTitle, siteLogo, primaryMenu, post.*, etc.)
    const propsUsed = new Set<string>();
    
    // Check if this component already has a posts.map() - if so, it manages its own loop
    const hasPostsMap = jsx.includes('posts.map(') || jsx.includes('posts && posts.map(');
    
    // Match both simple props {propName} and object properties {obj.prop}
    const propMatches = jsx.matchAll(/\{([a-zA-Z][a-zA-Z0-9.]*?)(?:\s|\}|\[|\.|,|\))/g);
    for (const match of propMatches) {
      const fullProp = match[1];
      
      // If component has posts.map(), it needs posts array as prop
      if (fullProp === 'posts' && hasPostsMap) {
        propsUsed.add('posts');
      }
      // If using post.* without posts.map(), component expects post prop (loop iteration)
      else if (fullProp.startsWith('post.') && !hasPostsMap) {
        propsUsed.add('post');
      }
      // Simple props without dots (ignore post/posts as they're handled above)
      else if (!fullProp.includes('.') && fullProp !== 'post' && fullProp !== 'posts') {
        // Sanitize reserved JavaScript keywords
        const sanitized = this.sanitizePropName(fullProp);
        propsUsed.add(sanitized);
      }
    }

    // Generate component
    let code = `import React from 'react';\n`;
    
    // Add additional imports
    imports.forEach(imp => {
      if (imp !== 'React') {
        code += `import ${imp};\n`;
      }
    });

    code += `\n`;
    
    // Generate props interface if needed
    if (propsUsed.size > 0) {
      code += `interface ${componentName}Props {\n`;
      propsUsed.forEach(prop => {
        code += `  ${prop}?: any;\n`;
      });
      code += `}\n\n`;
    }
    
    code += `/**\n`;
    code += ` * ${pattern.title}\n`;
    if (pattern.description) {
      code += ` * ${pattern.description}\n`;
    }
    code += ` */\n`;
    
    if (propsUsed.size > 0) {
      const propsDestructure = Array.from(propsUsed).join(', ');
      code += `export const ${componentName}: React.FC<${componentName}Props> = ({ ${propsDestructure} }) => {\n`;
    } else {
      code += `export const ${componentName}: React.FC = () => {\n`;
    }
    
    code += `  return (\n`;
    code += `    <>\n`;
    code += `      ${jsx}\n`;
    code += `    </>\n`;
    code += `  );\n`;
    code += `};\n`;

    // Format code
    try {
      code = await prettier.format(code, {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
      });
    } catch (e) {
      // Formatting failed, return unformatted
    }

    return code;
  }

  /**
   * Generate template part component (Header, Footer, etc.)
   */
  async generatePartComponent(
    partName: string,
    blocks: any[],
  ): Promise<string> {
    const componentName = this.toPascalCase(partName);
    const imports = new Set<string>(['React']);
    
    // Transform blocks and collect pattern imports
    const patternImports = new Set<string>();
    let hasCircularDependency = false;
    
    blocks.forEach((block, index) => {
      this.logger.log(`[${componentName}] Block ${index}: ${block.blockName}, attrs: ${JSON.stringify(block.attrs)}`);
      
      // Check if this is a pattern reference
      const blockType = block.blockName?.replace(/^(core|wp)\//, '') || '';
      this.logger.log(`  → blockType extracted: "${blockType}"`);
      
      if (blockType === 'pattern' && block.attrs?.slug) {
        const patternName = this.patternSlugToComponentName(block.attrs.slug);
        this.logger.log(`  → Pattern found: ${patternName} (comparing with ${componentName})`);
        
        // Check for circular dependency
        if (patternName.toLowerCase() === componentName.toLowerCase()) {
          this.logger.log(`  → CIRCULAR DEPENDENCY DETECTED!`);
          hasCircularDependency = true;
          // Don't add to imports, we'll handle it differently
        } else {
          this.logger.log(`  → Adding to patternImports`);
          patternImports.add(patternName);
        }
      }
    });

    let code = `import React from 'react';\n`;
    
    // For circular dependencies, import the pattern with an alias
    if (hasCircularDependency) {
      const patternFileName = this.toKebabCase(componentName);
      code += `import { ${componentName} as ${componentName}Pattern } from '../patterns/${patternFileName}';\n\n`;
      code += `// This part wraps the ${componentName} pattern\n`;
      code += `export const ${componentName}: React.FC<any> = (props) => {\n`;
      code += `  return <${componentName}Pattern {...props} />;\n`;
      code += `};\n`;
    } else {
      // Add pattern imports if any
      if (patternImports.size > 0) {
        patternImports.forEach(patternName => {
          code += `import { ${patternName} } from '../patterns/${this.toKebabCase(patternName)}';\n`;
        });
        code += `\n`;
      }
      
      code += `export const ${componentName}: React.FC<any> = (props) => {\n`;
      code += `  return (\n`;
      
      // Render patterns that were imported
      if (patternImports.size > 0) {
        code += `    <>\n`;
        patternImports.forEach(patternName => {
          code += `      <${patternName} />\n`;
        });
        code += `    </>\n`;
      } else {
        // No patterns to render
        code += `    <div className="${this.toKebabCase(componentName)}">\n`;
        code += `      {/* ${componentName} content */}\n`;
        code += `    </div>\n`;
      }
      
      code += `  );\n`;
      code += `};\n`;
    }

    try {
      code = await prettier.format(code, {
        parser: 'typescript',
        singleQuote: true,
      });
    } catch (e) {}

    return code;
  }

  /**
   * Convert pattern slug to component name
   */
  private patternSlugToComponentName(slug: string): string {
    // Remove theme prefix if exists
    const parts = slug.split('/');
    const name = parts.length > 1 ? parts[1] : parts[0];

    return name
      .split('-')
      .map(word => this.capitalize(word))
      .join('');
  }

  /**
   * Capitalize first letter
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Sanitize prop names to avoid reserved JavaScript keywords
   */
  private sanitizePropName(prop: string): string {
    const reserved = ['new', 'delete', 'class', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'typeof', 'instanceof', 'void', 'default', 'export', 'import'];
    if (reserved.includes(prop.toLowerCase())) {
      return `${prop}_`;
    }
    return prop;
  }

  /**
   * Convert to PascalCase (handle hyphens and underscores)
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
}
