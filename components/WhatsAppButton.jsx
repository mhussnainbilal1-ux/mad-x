const whatsappNumber = '923044989753'.replace(
  /\D/g,
  "",
);

export default function WhatsAppButton() {
  if (!whatsappNumber) return null;

  return (
    <a
      className="whatsappFloat"
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MADX Sports on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M16.04 3A12.82 12.82 0 0 0 5.18 22.65L3 29l6.59-2.12A12.89 12.89 0 1 0 16.04 3Zm0 23.58a10.62 10.62 0 0 1-5.42-1.48l-.39-.23-3.91 1.26 1.28-3.8-.25-.4a10.58 10.58 0 1 1 8.69 4.65Zm5.82-7.94c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57a9.55 9.55 0 0 1-1.77-2.2c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.31.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.36-.25-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.42 4.79.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.26-.74.26-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z"
        />
      </svg>
    </a>
  );
}
