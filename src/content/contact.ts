export const email = 'hritabratabardhan13579@gmail.com';

export type ContactLink = { label: string; value: string; href?: string; copy?: string };

export const contactLinks: ContactLink[] = [
  { label: 'Email', value: email, href: `mailto:${email}` },
  { label: 'GitHub', value: '@FzAlpha', href: 'https://github.com/FzAlpha' },
  { label: 'LinkedIn', value: 'Hritabrata Bardhan', href: 'https://www.linkedin.com/in/hritabrata-bardhan-12b498365/' },
  { label: 'LeetCode', value: 'Fz_Alpha_07', href: 'https://leetcode.com/u/Fz_Alpha_07/' },
  { label: 'Discord', value: 'fz_alpha_1', copy: 'fz_alpha_1' },
];
