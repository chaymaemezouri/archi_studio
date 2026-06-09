/** Applique le thème avant le paint pour éviter un flash (lit les prefs utilisateur). */
export default function ThemeScript() {
  const script = `(function(){try{var k="architecture-studio-user-prefs";var t="dark";var r=localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p.theme==="light"||p.theme==="dark")t=p.theme;}var e=document.documentElement;e.classList.remove("dark","light");e.classList.add(t);e.style.colorScheme=t==="light"?"light":"dark";}catch(x){document.documentElement.classList.add("dark");}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
