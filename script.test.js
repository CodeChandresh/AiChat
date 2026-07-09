const { escapeHTML } = require('./script.js');

describe('escapeHTML', () => {
    test('replaces & with &amp;', () => {
        expect(escapeHTML('Jack & Jill')).toBe('Jack &amp; Jill');
    });

    test('replaces < with &lt;', () => {
        expect(escapeHTML('1 < 2')).toBe('1 &lt; 2');
    });

    test('replaces > with &gt;', () => {
        expect(escapeHTML('2 > 1')).toBe('2 &gt; 1');
    });

    test('replaces " with &quot;', () => {
        expect(escapeHTML('He said "hello"')).toBe('He said &quot;hello&quot;');
    });

    test('replaces \' with &#039;', () => {
        expect(escapeHTML("It's a test")).toBe('It&#039;s a test');
    });

    test('replaces newlines with <br>', () => {
        expect(escapeHTML('Line 1\nLine 2')).toBe('Line 1<br>Line 2');
    });

    test('replaces multiple occurrences of characters', () => {
        expect(escapeHTML('&& << >> "" \'\' \n\n')).toBe('&amp;&amp; &lt;&lt; &gt;&gt; &quot;&quot; &#039;&#039; <br><br>');
    });

    test('returns empty string when given empty string', () => {
        expect(escapeHTML('')).toBe('');
    });

    test('handles string with no special characters', () => {
        expect(escapeHTML('Hello World')).toBe('Hello World');
    });

    test('handles complex HTML snippets correctly', () => {
        const input = '<div class="test">It\'s a & test\n</div>';
        const expected = '&lt;div class=&quot;test&quot;&gt;It&#039;s a &amp; test<br>&lt;/div&gt;';
        expect(escapeHTML(input)).toBe(expected);
    });
});
