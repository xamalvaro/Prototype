export const users = [
  { id: 1, username: 'User1', followers: 120, avatar: null },
  { id: 2, username: 'User2', followers: 85, avatar: null },
  { id: 3, username: 'User3', followers: 203, avatar: null },
  { id: 4, username: 'User4', followers: 67, avatar: null },
  { id: 5, username: 'User5', followers: 311, avatar: null },
  { id: 6, username: 'Cabo32', followers: 54, avatar: null },
  { id: 7, username: 'Cabo30', followers: 99, avatar: null },
  { id: 8, username: 'Cabo323', followers: 23, avatar: null },
  { id: 9, username: 'Cabo320', followers: 41, avatar: null },
];

export const posts = [
  {
    id: 1,
    author: 'User3',
    title: 'First day at the Dog Park!',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
    likes: 42,
    replyCount: 4,
    pinnedDiscussion: 'He absolutely loved it! Made three new friends right away.',
    comments: [
      {
        id: 1,
        author: 'User3',
        text: 'He absolutely loved it! Made three new friends right away.',
        replies: [
          {
            id: 11,
            author: 'User2',
            text: 'That is so sweet! What breed is he?',
            replies: [
              {
                id: 111,
                author: 'User3',
                text: 'He is a golden retriever mix! Super friendly.',
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        author: 'User1',
        text: 'Looks like so much fun! Which park did you go to?',
        replies: [],
      },
    ],
  },
  {
    id: 2,
    author: 'User1',
    title: 'Morning hike trail',
    image: 'https://picsum.photos/seed/hike/400/300',
    likes: 28,
    replyCount: 3,
    pinnedDiscussion: 'Started the morning with a 5-mile trail. Worth every step!',
    comments: [
      {
        id: 3,
        author: 'User2',
        text: 'Which trail is this? Looks gorgeous!',
        replies: [
          {
            id: 31,
            author: 'User1',
            text: 'Pine Ridge Trail, about 30 min from the city.',
            replies: [],
          },
        ],
      },
      {
        id: 4,
        author: 'User5',
        text: 'I need to get out more. This is inspiring!',
        replies: [],
      },
    ],
  },
  {
    id: 3,
    author: 'User2',
    title: 'Coffee shop finds',
    image: 'https://picsum.photos/seed/coffee/400/300',
    likes: 61,
    replyCount: 5,
    pinnedDiscussion: 'Found this hidden gem downtown. Best latte I have had in years.',
    comments: [
      {
        id: 5,
        author: 'User4',
        text: 'What is the name of the place? Need to visit!',
        replies: [
          {
            id: 51,
            author: 'User2',
            text: 'Brew & Bloom on 5th Ave. Highly recommend!',
            replies: [],
          },
        ],
      },
      {
        id: 6,
        author: 'User3',
        text: 'The interior looks amazing too.',
        replies: [],
      },
    ],
  },
  {
    id: 4,
    author: 'User5',
    title: 'Sunset at the lake',
    image: 'https://picsum.photos/seed/lake/400/300',
    likes: 95,
    replyCount: 6,
    pinnedDiscussion: 'Nothing beats a quiet evening by the water.',
    comments: [
      {
        id: 7,
        author: 'User1',
        text: 'Absolutely stunning shot!',
        replies: [],
      },
      {
        id: 8,
        author: 'User4',
        text: 'Is this near the city? I want to go!',
        replies: [
          {
            id: 81,
            author: 'User5',
            text: 'About an hour drive east. Totally worth it.',
            replies: [],
          },
        ],
      },
    ],
  },
];

export const followerNotifications = [
  { id: 1, username: 'User4', action: 'Just followed!' },
  { id: 2, username: 'User2', action: 'Just followed!' },
  { id: 3, username: 'Cabo32', action: 'Just followed!' },
];

export const conversations = [];
