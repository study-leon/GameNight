import { Message } from '@/types';

const messages: Message[] = [
  {
    id: 'm-1',
    content: 'Hey! How was your weekend?',
    createdAt: '2025-01-20T09:15:00Z',
    image: 'https://picsum.photos/id/10/200/200',
    user: {
      id: 'u-1',
      name: 'Sarah Chen',
      avatar: 'https://picsum.photos/id/11/200/200',
    },
  },
  {
    id: 'm-2',
    content: 'Pretty good! Went hiking with some friends ⛰️',
    createdAt: '2025-01-20T09:17:30Z',
    image: 'https://picsum.photos/id/20/200/200',
    user: {
      id: 'u-2',
      name: 'Liam Novak',
      avatar: 'https://picsum.photos/id/12/200/200',
    },
  },
  {
    id: 'm-3',
    content: 'Nice! I’ve been meaning to get out more lately 😅',
    createdAt: '2025-01-20T09:18:45Z',
    user: {
      id: 'u-1',
      name: 'Sarah Chen',
      avatar: 'https://picsum.photos/id/11/200/200',
    },
  },
  {
    id: 'm-4',
    content: 'Yeah, definitely! The fresh air helps clear your head.',
    createdAt: '2025-01-20T09:20:00Z',
    user: {
      id: 'u-2',
      name: 'Liam Novak',
      avatar: 'https://picsum.photos/id/12/200/200',
    },
  },
  {
    id: 'm-5',
    content: 'By the way, did you check the new design mockups yet?',
    createdAt: '2025-01-20T09:22:10Z',
    user: {
      id: 'u-1',
      name: 'Sarah Chen',
      avatar: 'https://picsum.photos/id/11/200/200',
    },
  },
  {
    id: 'm-6',
    content: 'Not yet, but I’ll review them after standup 👍',
    createdAt: '2025-01-20T09:24:00Z',
    user: {
      id: 'u-2',
      name: 'Liam Novak',
      avatar: 'https://picsum.photos/id/12/200/200',
    },
  },
];
export default messages;