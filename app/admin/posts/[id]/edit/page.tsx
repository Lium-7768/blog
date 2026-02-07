import EditPostContent from './EditPostContent'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return <EditPostContent id={id} />
}
