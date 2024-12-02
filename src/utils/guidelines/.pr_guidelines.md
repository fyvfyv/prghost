### PR Description Guidelines

Please ensure the PR description follows these strict guidelines:

1. **What did you do?** (2-3 sentences)
    - Provide a clear, factual summary of the actual changes made.
    - Focus only on what was implemented, not potential benefits.
    - Avoid speculation about future improvements.
    - Keep this section strictly factual and limited to 2-5 sentences, focusing only on the actual changes made.
    - If any points are marked as TODO in the code changes, briefly list them at the end of this section to highlight work that will be done in follow up PRs.
    - It should be a high level summary of changes and business context (if it is provided).
    - Does not repeat changes listed in other sections.

    - Examples:
      *Added a new breadcrumb customization feature to Sentry that extracts clicked element text from data- attributes and aria-label. Implemented fallback to element content when attributes are unavailable.*
      *Implemented rate limiting for the authentication API with a sliding window algorithm. Added Redis-based storage for tracking request counts and configured default limits of 100 requests per minute per IP.*
      *Fixed mobile navigation menu layout issues on iOS devices by restructuring flexbox container hierarchy. Added proper viewport meta tags and touch event handlers.*
      *Migrated user notification service from REST to GraphQL, converting 12 existing endpoints. Added type definitions and resolvers while maintaining existing response formats for backward compatibility.*

2. **Why did you do it?** (2-5 sentences)
    - Include only reasons supported by provided context, otherwise rely on visible technical needs.
    - If no clear business context is provided, focus on technical necessity.
    - Avoid assumptions about UX or platform improvements.
    - Does not repeat changes listed in other sections.
    - Examples:
      *Current breadcrumb implementation was missing critical user interaction details, causing incomplete error context. Internal logging showed 40% of customer issues required additional user steps clarification.*
      *Recent security audit identified SQL injection vulnerabilities in legacy user input handlers. Critical severity finding requires immediate remediation per security policy.*
      *User analytics revealed 30% of checkout failures occurred due to payment timeouts. Database query optimization was needed as payment validation queries consistently exceeded 5-second SLA.*

3. **How did you do it?**
    - List specific technical implementation details from the code changes
    - Focus on architectural decisions and key technical choices
    - Include any important technical constraints or considerations
    - Does not repeat changes listed in other sections
    - Examples:
    *Implemented a new BreadcrumbProcessor class that: - Extracts text using a priority-based attribute reader (data- > aria-label > textContent) - Integrates with existing Sentry event pipeline - Maintains backward compatibility with existing breadcrumb format*
    *API error handling:Created centralized error handler: - Added structured error responses. - Implemented retry logic. - Added error tracking integration*

**Additional Requirements:**
- Keep all sections concise and factual
- Include screenshots or diagrams only if they demonstrate implemented changes
- Preserve any existing template structure and formatting
- If information is missing for any section, keep it minimal rather than making assumptions
