import {Channel} from "@/types"

const channels: Channel[] = [
  {
    id: '1',
    name: 'Tech Daily',
    lastMessage: {
      id: 'm-1',
      content: 'Shipping the new feature flag rollout this week!',
      createdAt: '2025-08-18T10:24:00Z',
    },
    avatar: 'https://picsum.photos/id/11/200/200',
  },
  {
    id: '2',
    name: 'Design Lounge',
    lastMessage: {
      id: 'm-2',
      content: 'Can we update the brand colors before next release?',
      createdAt: '2025-08-19T14:42:00Z',
    },
    avatar: 'https://picsum.photos/id/12/200/200',
  },
  {
    id: '3',
    name: 'Dev Chat',
    lastMessage: {
      id: 'm-3',
      content: 'Found a bug in the new API endpoint, fixing it now.',
      createdAt: '2025-08-20T09:13:00Z',
    },
    avatar: 'https://picsum.photos/id/13/200/200',
  },
  {
    id: '4',
    name: 'Marketing Hub',
    lastMessage: {
      id: 'm-4',
      content: 'Q4 campaign plan is ready for review 🚀',
      createdAt: '2025-08-21T16:30:00Z',
    },
    avatar: 'https://picsum.photos/id/14/200/200',
  },
  {
    id: '5',
    name: 'AI Research',
    lastMessage: {
      id: 'm-5',
      content: 'Testing new model weights — results look promising!',
      createdAt: '2025-08-22T11:55:00Z',
    },
    avatar: 'https://picsum.photos/id/15/200/200',
  },
  
];

export default channels;