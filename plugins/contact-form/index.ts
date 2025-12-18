/**
 * Plugin Name: Contact Form
 * Plugin URI: https://nestpress.dev/plugins/contact-form
 * Description: Easy-to-use contact form builder with spam protection, email notifications, and form submissions management.
 * Version: 1.0.0
 * Author: NestPress Team
 * Author URI: https://nestpress.dev
 * License: GPL-2.0+
 * Text Domain: contact-form
 * Requires at least: 1.0.0
 * Requires Node: 18.0.0
 */

// Note: Types are provided at runtime by the plugin loader
interface NestPressPlugin {
  metadata?: Record<string, string>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  setup?: (api: any) => Promise<void>;
  registerHooks?: (api: any) => void;
  registerRoutes?: (api: any) => void;
  registerAdminMenu?: (api: any) => void;
  registerSettings?: (api: any) => void;
}

interface FormField {
  name: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormSubmission {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
  ip?: string;
  userAgent?: string;
  status: 'unread' | 'read' | 'spam' | 'trash';
}

/**
 * Contact Form Plugin
 */
const ContactForm: NestPressPlugin = {
  metadata: {
    Name: 'Contact Form',
    Version: '1.0.0',
    Description: 'Easy-to-use contact form builder',
    Author: 'NestPress Team',
  },

  onActivate: async () => {
    console.log('📝 Contact Form plugin activated!');
  },

  onDeactivate: async () => {
    console.log('Contact Form plugin deactivated');
  },

  setup: async (api: any) => {
    api.log('Contact Form initialized');
  },

  registerHooks: (api: any) => {
    // Register contact form shortcode
    api.addShortcode('contact_form', (attrs: Record<string, string>, content: string, tag: string) => {
      const formId = attrs.id || 'default';
      const title = attrs.title || 'Contact Us';
      
      return `
        <div class="np-contact-form" data-form-id="${formId}">
          <h3>${title}</h3>
          <form action="/api/v1/forms/submit" method="POST">
            <input type="hidden" name="form_id" value="${formId}" />
            <div class="form-field">
              <label for="name">Name *</label>
              <input type="text" name="name" id="name" required />
            </div>
            <div class="form-field">
              <label for="email">Email *</label>
              <input type="email" name="email" id="email" required />
            </div>
            <div class="form-field">
              <label for="message">Message *</label>
              <textarea name="message" id="message" rows="5" required></textarea>
            </div>
            <button type="submit">Send Message</button>
          </form>
        </div>
      `;
    });

    // Process form submissions
    api.addAction('form:submission', async (submission: FormSubmission) => {
      api.log(`New form submission: ${submission.formId}`);
      
      // Check for spam
      const isSpam = await checkForSpam(submission);
      if (isSpam) {
        submission.status = 'spam';
        api.log('Submission marked as spam');
      }
      
      // Send email notification
      await api.doAction('send_email', {
        to: await api.getOption('admin_email', 'admin@example.com'),
        subject: `New Contact Form Submission`,
        body: formatSubmissionEmail(submission),
      });
    }, 10);
  },

  registerRoutes: (api: any) => {
    // Form submission endpoint
    api.registerRoute('POST', '/forms/submit', async (req: any, res: any) => {
      const { form_id, ...data } = req.body;
      
      const submission: FormSubmission = {
        id: generateId(),
        formId: form_id,
        data,
        submittedAt: new Date(),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'unread',
      };

      // Trigger submission action
      await api.doAction('form:submission', submission);

      return { success: true, message: 'Form submitted successfully' };
    }, { auth: false, rateLimit: 5 });

    // Get form submissions (admin)
    api.registerRoute('GET', '/forms/:formId/submissions', async (req: any) => {
      // Return submissions for the form
      return { submissions: [] };
    }, { auth: true, roles: ['admin', 'editor'] });
  },

  registerAdminMenu: (api: any) => {
    api.addMenuPage({
      pageTitle: 'Contact Forms',
      menuTitle: 'Forms',
      capability: 'manage_options',
      menuSlug: 'contact-forms',
      icon: '📝',
      position: 25,
    });

    api.addSubmenuPage('contact-forms', {
      pageTitle: 'All Forms',
      menuTitle: 'All Forms',
      capability: 'manage_options',
      menuSlug: 'contact-forms',
    });

    api.addSubmenuPage('contact-forms', {
      pageTitle: 'Add New Form',
      menuTitle: 'Add New',
      capability: 'manage_options',
      menuSlug: 'contact-forms-new',
    });

    api.addSubmenuPage('contact-forms', {
      pageTitle: 'Submissions',
      menuTitle: 'Submissions',
      capability: 'manage_options',
      menuSlug: 'contact-forms-submissions',
    });
  },

  registerSettings: (api: any) => {
    api.registerSetting('contact_form', 'cf_admin_email', {
      type: 'string',
      default: '',
      description: 'Email address for form notifications',
    });

    api.registerSetting('contact_form', 'cf_spam_protection', {
      type: 'boolean',
      default: true,
      description: 'Enable spam protection',
    });

    api.registerSetting('contact_form', 'cf_recaptcha_key', {
      type: 'string',
      default: '',
      description: 'Google reCAPTCHA site key',
    });
  },
};

/**
 * Simple spam check
 */
async function checkForSpam(submission: FormSubmission): Promise<boolean> {
  const content = Object.values(submission.data).join(' ').toLowerCase();
  
  // Check for common spam patterns
  const spamPatterns = [
    /\b(viagra|casino|lottery|winner|prize)\b/i,
    /\[url=/i,
    /<a\s+href=/i,
  ];

  return spamPatterns.some(pattern => pattern.test(content));
}

/**
 * Format submission for email
 */
function formatSubmissionEmail(submission: FormSubmission): string {
  let body = `New form submission received:\n\n`;
  
  for (const [key, value] of Object.entries(submission.data)) {
    body += `${key}: ${value}\n`;
  }
  
  body += `\nSubmitted: ${submission.submittedAt.toISOString()}`;
  body += `\nIP: ${submission.ip || 'Unknown'}`;
  
  return body;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default ContactForm;
