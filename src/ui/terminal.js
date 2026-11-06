// Interactive terminal (same commands as before). Emits events so K-2SO can react.
export function initTerminal({ audio, events }) {
  const input = document.getElementById('terminal-input');
  const history = document.getElementById('terminal-history');
  const screen = document.getElementById('terminal-screen');
  if (!input || !history) return;

  const stack = [];
  let idx = -1;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const commands = {
    help: () => `<span class="sub">Commands Available:</span>
  <span class="hl">about</span>      - Personal summary & background
  <span class="hl">skills</span>     - Technical competencies & stack
  <span class="hl">projects</span>   - Featured GitHub repositories & links
  <span class="hl">contact</span>    - Direct email & social handles
  <span class="hl">github</span>     - Open GitHub profile
  <span class="hl">clear</span>      - Clear terminal screen`,
    about: () => `<span class="sub">Hritabrata Bardhan (FzAlpha)</span>
• Computer Science Engineering Student
• Low-level systems programming in C++ / POSIX
• Operating system internals & custom Linux terminal shells
• 200+ LeetCode & algorithmic challenges solved`,
    skills: () => `<span class="sub">Languages:</span> C++, C, Python, Java, Bash, Lua, JavaScript, HTML/CSS
<span class="sub">Environment:</span> Arch Linux, EndeavourOS, Hyprland, Docker, Git, Neovim, CMake`,
    projects: () => `1. <a href="https://github.com/FzAlpha/log-Manager" target="_blank" rel="noopener">log-Manager</a> - C++ telemetry & DSA tracker
2. <a href="https://github.com/FzAlpha/custom-linux-shell" target="_blank" rel="noopener">custom-linux-shell</a> - Custom Linux terminal with process piping & syscalls
3. <a href="https://github.com/FzAlpha/algo-vault" target="_blank" rel="noopener">algo-vault</a> - 200+ optimal DSA solutions
4. <a href="https://github.com/FzAlpha" target="_blank" rel="noopener">Multi-Agent AI Platform</a> - Parallel task automation`,
    contact: () => `Email: <a href="mailto:hritabratabardhan13579@gmail.com">hritabratabardhan13579@gmail.com</a>
LinkedIn: <a href="https://www.linkedin.com/in/hritabrata-bardhan-12b498365/" target="_blank" rel="noopener">Hritabrata Bardhan</a>
GitHub: <a href="https://github.com/FzAlpha" target="_blank" rel="noopener">github.com/FzAlpha</a>
Discord: <span class="hl">fz_alpha_1</span>`,
    github: () => { window.open('https://github.com/FzAlpha', '_blank'); return '<span class="sub">Opened GitHub profile in new tab.</span>'; },
    clear: () => { history.innerHTML = ''; return null; },
  };

  screen.addEventListener('click', () => input.focus());

  input.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Backspace') { audio.key(); events.dispatchEvent(new Event('terminal:key')); }
    if (e.key === 'Enter') {
      const raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      stack.push(raw);
      idx = stack.length;
      const cmd = raw.toLowerCase();
      events.dispatchEvent(new CustomEvent('terminal:command', { detail: cmd }));
      const out = commands[cmd] ? commands[cmd]() : `Command not found: '${esc(raw)}'. Type <span class="hl">help</span> to view commands.`;
      if (out === null) return;
      const row = document.createElement('div');
      row.className = 'term-row';
      row.innerHTML = `<div class="term-echo-line"><b>●&nbsp;▶</b>${esc(raw)}</div><div class="term-output">${out}</div>`;
      history.appendChild(row);
      screen.scrollTop = screen.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      if (stack.length && idx > 0) input.value = stack[--idx];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (idx < stack.length - 1) input.value = stack[++idx]; else { idx = stack.length; input.value = ''; }
      e.preventDefault();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const cur = input.value.trim().toLowerCase();
      const m = cur && Object.keys(commands).find((c) => c.startsWith(cur));
      if (m) input.value = m;
    }
  });
}
