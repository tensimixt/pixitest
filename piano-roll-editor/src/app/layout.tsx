import './globals.css'

export const metadata = {
  title: 'Piano Roll Editor',
  description: 'A web-based piano roll editor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  )
}