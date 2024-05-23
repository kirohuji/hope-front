import { Helmet } from 'react-helmet-async';
// sections
import { ChatView } from 'src/sections/openai/view';

// ----------------------------------------------------------------------

export default function ChatPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Chat</title>
      </Helmet>

      <ChatView />
    </>
  );
}