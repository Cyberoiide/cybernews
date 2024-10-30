import { ImageResponse } from 'next/server'
 
export const runtime = 'edge'
 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const width = searchParams.get('width') || '200'
  const height = searchParams.get('height') || '100'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          background: '#f0f5ff',
          color: '#333',
        }}
      >
        CyberNews
      </div>
    ),
    {
      width: Number(width),
      height: Number(height),
    },
  )
}