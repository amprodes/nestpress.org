/**
 * Test file for JSX validator
 * This file contains intentional JSX errors to test the validation system
 */

// Test case 1: Fragment closed with div
const test1 = `
export function Test1() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </div>
  );
}
`;

// Test case 2: Tag mismatch
const test2 = `
export function Test2() {
  return (
    <div>
      <span>Content</span>
    </p>
  );
}
`;

// Test case 3: Unclosed fragment
const test3 = `
export function Test3() {
  return (
    <>
      <div>Content</div>
  );
}
`;

// Test case 4: Unmatched closing tag
const test4 = `
export function Test4() {
  return (
    <div>Content</div>
    </>
  );
}
`;

// Test case 5: Wrong property access
const test5 = `
export function Test5({ header }: { header?: SiteSettings }) {
  return (
    <div>{header?.general?.siteTitle}</div>
  );
}
`;

// Test case 6: Invalid ul > div > li structure
const test6 = `
export function Test6() {
  return (
    <ul>
      <div className="wrapper">
        <li>Item 1</li>
        <li>Item 2</li>
      </div>
    </ul>
  );
}
`;

// Test case 7: Multiple errors combined
const test7 = `
export function Test7({ primaryMenu, header }: { primaryMenu?: Menu; header?: SiteSettings }) {
  const menuItems = primaryMenu?.items || [];
  return (
    <nav>
      <ul>
        <div className="wrapper">
          {menuItems.map((item, i) => (
            <>
              <li key={i}>
                <a href={item.url}>{item.label}</a>
              </li>
            </div>
          ))}
        </div>
      </ul>
      <div className="site-title">{header?.general?.siteTitle}</div>
    </nav>
  );
}
`;

// Test case 8: Nested fragments with mismatches
const test8 = `
export function Test8() {
  return (
    <div>
      <>
        <span>First</span>
        <>
          <span>Nested</span>
        </div>
      </>
    </div>
  );
}
`;

export const testCases = {
  test1: { code: test1, name: 'Fragment closed with div', expectedError: 'fragment_tag_mismatch' },
  test2: { code: test2, name: 'Tag mismatch (span/p)', expectedError: 'tag_mismatch' },
  test3: { code: test3, name: 'Unclosed fragment', expectedError: 'unclosed_fragment' },
  test4: { code: test4, name: 'Unmatched closing fragment', expectedError: 'unmatched_closing' },
  test5: { code: test5, name: 'Wrong property access', expectedError: 'wrong_property' },
  test6: { code: test6, name: 'Invalid ul > div > li', expectedError: 'invalid_ul_child' },
  test7: { code: test7, name: 'Multiple errors', expectedError: 'multiple' },
  test8: { code: test8, name: 'Nested fragment mismatch', expectedError: 'fragment_tag_mismatch' },
};
