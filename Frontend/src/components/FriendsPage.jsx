import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Post from './Post';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import useGetAllPost from '@/hooks/useGetAllPost';
import { Users, LayoutGrid, MessageCircle } from 'lucide-react';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'list'
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const navigate = useNavigate();
  useGetAllPost();

  const connections = user?.connections || [];
  const connectionIds = connections.map(c => c._id || c);

  // Filter posts to only show those from connections
  const friendsPosts = posts?.filter((post) => connectionIds.includes(post.author._id)) || [];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-zinc-100">
          <Users className="w-6 h-6 text-[#0095F6]" />
          Friends
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === 'feed' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          Friends Activity
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${activeTab === 'list' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
        >
          <Users className="w-5 h-5" />
          My Connections ({connections.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'feed' && (
        <div className="max-w-xl mx-auto flex flex-col gap-6">
          {friendsPosts.length === 0 ? (
            <div className="text-center text-gray-500 mt-10 p-10 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No recent activity</h3>
              <p className="text-sm mt-2">When your friends post, you'll see it here.</p>
            </div>
          ) : (
            friendsPosts.map((post) => <Post key={post._id} post={post} />)
          )}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.length === 0 ? (
            <div className="text-center text-gray-500 col-span-full mt-10 p-10 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
              You haven't added any friends yet.
            </div>
          ) : (
            connections.map((friend) => (
              <div key={friend._id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-shadow">
                <Avatar className="w-14 h-14 border border-gray-100 dark:border-zinc-800 cursor-pointer" onClick={() => navigate(`/profile/${friend._id}`)}>
                  <AvatarImage src={friend.profilePicture} className="object-cover" />
                  <AvatarFallback className="bg-gray-100 font-bold text-gray-700">{friend.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100 cursor-pointer truncate" onClick={() => navigate(`/profile/${friend._id}`)}>{friend.username}</h3>
                  <Button
                    onClick={() => navigate('/chat')}
                    variant="outline"
                    className="mt-2 text-xs h-8 flex items-center gap-2 border-blue-200 dark:border-blue-900/50 text-[#0095F6] hover:bg-blue-50 dark:hover:bg-blue-900/20 w-fit"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
