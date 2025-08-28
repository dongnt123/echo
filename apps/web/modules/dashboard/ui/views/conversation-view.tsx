import Image from "next/image"

const ConversationView = () => {
  return (
    <div className="flex flex-1 flex-col h-full gap-4 bg-muted">
      <div className="flex flex-1 items-center justify-center gap-2">
        <Image src="/logo.svg" alt="logo" width={40} height={40} />
        <p className="font-semibold text-lg">Echo</p>
      </div>
    </div>
  )
}

export default ConversationView