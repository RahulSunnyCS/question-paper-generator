export default function HomePage() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <h1>Question Paper Generator Backend</h1>
      <p>
        This server hosts the PDF generation endpoint at
        <code> /api/generate-pdf</code>.
      </p>
    </main>
  );
}
