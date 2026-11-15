export const metadata = { title: "contact | infracringe" };

const links = [
  { label: "github", href: "https://github.com/cybercringe2520", text: "github.com/cybercringe2520" },
  { label: "linkedin", href: "https://www.linkedin.com/in/v-kot-403b553a6", text: "linkedin.com/in/vkot" },
  { label: "email", href: "mailto:cybercringe2520@gmail.com", text: "cybercringe2520@gmail.com" },
];

export default function Contact() {
  return (
    <>
      <h1 className="mb-6 font-bold">$ cat /contact</h1>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <span className="inline-block w-24 text-neutral-500">{link.label}</span>
            <a
              href={link.href}
              className="text-green-400 hover:underline"
              {...(link.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
            >
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
