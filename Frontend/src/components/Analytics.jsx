import React from "react";
import { useSelector } from "react-redux";
import { BarChart3, TrendingUp, Heart, Eye, IndianRupee, MessageCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Button } from "./ui/button";

const Analytics = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', ifscCode: '' });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const posts = user.posts || [];
  
  // Calculate aggregated stats
  const totalPosts = posts.length;
  let totalViews = 0;
  let totalLikes = 0;
  let totalComments = 0;

  // We want to sort posts by engagement (views + likes + comments) to find top performers
  const postsWithStats = posts.map(post => {
    const views = post.viewedBy?.length || 0;
    const likes = post.likes?.length || 0;
    const comments = post.comments?.length || 0;
    
    totalViews += views;
    totalLikes += likes;
    totalComments += comments;

    return {
      ...post,
      views,
      likes,
      comments,
      engagementScore: views + (likes * 2) + (comments * 3) // Weighted score
    };
  });

  const totalEarnings = user.walletBalance || 0;
  
  // Engagement rate: (Likes + Comments) / Views
  const engagementRate = totalViews > 0 
    ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) 
    : "0.0";

  // Sort top posts by our weighted engagement score
  const topPosts = [...postsWithStats].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 5);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (totalEarnings < 100) return toast.error("Minimum withdrawal is ₹100");
    
    try {
      setLoading(true);
      const res = await axios.post("/api/v1/payment/withdraw", 
        { ...bankDetails, amount: totalEarnings },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setOpenWithdraw(false);
        setBankDetails({ accountName: '', accountNumber: '', ifscCode: '' });
        // Update local balance
        dispatch(setAuthUser({ ...user, walletBalance: res.data.newBalance }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-6 mb-8 border-gray-100">
        <div className="p-3 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white shadow-sm">
          <BarChart3 size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creator Studio</h1>
          <p className="text-gray-500 text-sm mt-1">
            Analytics and earnings dashboard for <span className="font-semibold text-gray-700">@{user.username}</span>
          </p>
        </div>
        
        <div className="ml-auto">
          <Button 
            onClick={() => setOpenWithdraw(true)} 
            disabled={totalEarnings < 100}
            className={`font-semibold rounded-xl flex items-center gap-2 ${totalEarnings >= 100 ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Wallet size={18} />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <IndianRupee size={20} />
            <span className="text-sm tracking-wider uppercase">Total Earnings</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">₹{totalEarnings.toFixed(2)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-500 font-semibold">
            <Eye size={20} />
            <span className="text-sm tracking-wider uppercase">Total Views</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{totalViews}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-rose-500 font-semibold">
            <Heart size={20} />
            <span className="text-sm tracking-wider uppercase">Total Likes</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{totalLikes}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-purple-600 font-semibold">
            <TrendingUp size={20} />
            <span className="text-sm tracking-wider uppercase">Engagement Rate</span>
          </div>
          <span className="text-3xl font-bold text-gray-900">{engagementRate}%</span>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Top Performing Posts</h2>
        </div>

        {topPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You haven't published any posts yet. Start creating to see analytics!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {topPosts.map((post, index) => {
              // Calculate estimated earnings for this specific post (assuming 0.01 per view)
              const postEarnings = (post.views * 0.01).toFixed(2);
              
              return (
                <div key={post._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-gray-300 text-lg w-4 text-center">{index + 1}</div>
                    
                    <img 
                      src={post.image} 
                      alt="Post thumbnail" 
                      className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-100 cursor-pointer"
                      onClick={() => navigate(`/profile/${user._id}`)}
                    />
                    
                    <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                      <span className="font-semibold text-gray-900 truncate">
                        {post.caption || "No caption"}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-10 text-right pr-4">
                    <div className="hidden sm:flex flex-col items-center gap-1">
                      <Heart size={16} className="text-gray-400" />
                      <span className="font-semibold text-sm text-gray-700">{post.likes}</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-1">
                      <MessageCircle size={16} className="text-gray-400" />
                      <span className="font-semibold text-sm text-gray-700">{post.comments}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-blue-600 font-bold">
                        <Eye size={16} />
                        <span>{post.views}</span>
                      </div>
                      <span className="text-xs text-green-600 font-semibold mt-1">
                        +₹{postEarnings}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 border-none shadow-2xl bg-white">
          <DialogHeader className="font-bold text-xl text-gray-900 border-b pb-4 mb-4">
            Withdraw Earnings
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex items-center justify-between">
              <span className="font-medium text-sm">Available Balance</span>
              <span className="text-2xl font-bold">₹{totalEarnings.toFixed(2)}</span>
            </div>
            
            <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Account Holder Name</label>
                <input 
                  type="text" 
                  required
                  value={bankDetails.accountName}
                  onChange={e => setBankDetails({...bankDetails, accountName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bank Account Number</label>
                <input 
                  type="text" 
                  required
                  value={bankDetails.accountNumber}
                  onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="2323230058869894"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">IFSC Code</label>
                <input 
                  type="text" 
                  required
                  value={bankDetails.ifscCode}
                  onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all uppercase"
                  placeholder="HDFC0001234"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl mt-2 text-lg shadow-md shadow-green-600/20 transition-all"
              >
                {loading ? "Processing..." : `Withdraw ₹${totalEarnings.toFixed(2)}`}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
