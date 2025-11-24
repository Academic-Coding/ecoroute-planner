
import React from 'react';
import { Review } from '../types';
import { Star, UserCircle, MessageSquare, X } from 'lucide-react';

interface ReviewsListProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ isOpen, onClose, reviews }) => {
  if (!isOpen) return null;

  // Filter for approved reviews only
  const approvedReviews = reviews.filter(r => r.status === 'approved');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col relative">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <MessageSquare className="w-6 h-6 text-brand-600" />
             <h3 className="text-xl font-bold text-slate-900">Community Reviews</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {approvedReviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No approved reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            approvedReviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-8 h-8 text-slate-300" />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{review.userName}</p>
                      <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">"{review.comment}"</p>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400">
           Showing {approvedReviews.length} approved reviews
        </div>
      </div>
    </div>
  );
};