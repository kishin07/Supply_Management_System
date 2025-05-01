import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BiddingContext = createContext();

export function useBidding() {
  return useContext(BiddingContext);
}

export function BiddingProvider({ children }) {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // RFQs (Request for Quotations)
  const [rfqs, setRfqs] = useState(() => {
    const savedRfqs = localStorage.getItem('rfqs');
    return savedRfqs ? JSON.parse(savedRfqs) : [];
  });

  // Bids submitted by suppliers
  const [bids, setBids] = useState(() => {
    const savedBids = localStorage.getItem('bids');
    return savedBids ? JSON.parse(savedBids) : [];
  });

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rfqs', JSON.stringify(rfqs));
  }, [rfqs]);

  useEffect(() => {
    localStorage.setItem('bids', JSON.stringify(bids));
  }, [bids]);

  // Create a new RFQ (company function)
  const createRfq = (rfqData) => {
    setLoading(true);
    setError('');
    
    try {
      const newRfq = {
        id: `rfq-${Date.now()}`,
        companyId: currentUser.id,
        companyName: currentUser.name,
        status: 'Posted',
        createdAt: new Date().toISOString(),
        ...rfqData
      };
      
      setRfqs(prevRfqs => [newRfq, ...prevRfqs]);
      return newRfq;
    } catch (err) {
      setError('Failed to create RFQ');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit a bid for an RFQ (supplier function)
  const submitBid = (rfqId, bidData) => {
    setLoading(true);
    setError('');
    
    try {
      const newBid = {
        id: `bid-${Date.now()}`,
        rfqId,
        supplierId: currentUser.id,
        supplierName: currentUser.name,
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        ...bidData
      };
      
      setBids(prevBids => [newBid, ...prevBids]);
      return newBid;
    } catch (err) {
      setError('Failed to submit bid');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update bid status (company function)
  const updateBidStatus = (bidId, status) => {
    setLoading(true);
    setError('');
    
    try {
      setBids(prevBids => 
        prevBids.map(bid => 
          bid.id === bidId ? { ...bid, status } : bid
        )
      );
      
      // If a bid is accepted, update the RFQ status to Awarded
      if (status === 'Accepted') {
        const bid = bids.find(b => b.id === bidId);
        if (bid) {
          setRfqs(prevRfqs => 
            prevRfqs.map(rfq => 
              rfq.id === bid.rfqId ? { ...rfq, status: 'Awarded' } : rfq
            )
          );
        }
      }
    } catch (err) {
      setError('Failed to update bid status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update RFQ status (company function)
  const updateRfqStatus = (rfqId, status) => {
    setLoading(true);
    setError('');
    
    try {
      setRfqs(prevRfqs => 
        prevRfqs.map(rfq => 
          rfq.id === rfqId ? { ...rfq, status } : rfq
        )
      );
      
      // If an RFQ is closed, reject all pending bids
      if (status === 'Closed') {
        setBids(prevBids => 
          prevBids.map(bid => 
            bid.rfqId === rfqId && bid.status === 'Submitted' 
              ? { ...bid, status: 'Rejected' } 
              : bid
          )
        );
      }
    } catch (err) {
      setError('Failed to update RFQ status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get RFQs based on user role
  const getRfqs = () => {
    if (userRole === 'company') {
      // Companies see their own RFQs
      return rfqs.filter(rfq => rfq.companyId === currentUser.id);
    } else if (userRole === 'supplier') {
      // Suppliers see all available RFQs
      return rfqs.filter(rfq => rfq.status === 'Posted' || rfq.status === 'Bidding');
    }
    return [];
  };

  // Get bids based on user role
  const getBids = (rfqId = null) => {
    if (userRole === 'company') {
      // Companies see bids for their RFQs
      const companyRfqIds = rfqs
        .filter(rfq => rfq.companyId === currentUser.id)
        .map(rfq => rfq.id);
      
      return rfqId 
        ? bids.filter(bid => bid.rfqId === rfqId)
        : bids.filter(bid => companyRfqIds.includes(bid.rfqId));
    } else if (userRole === 'supplier') {
      // Suppliers see their own bids
      return rfqId 
        ? bids.filter(bid => bid.rfqId === rfqId && bid.supplierId === currentUser.id)
        : bids.filter(bid => bid.supplierId === currentUser.id);
    }
    return [];
  };

  // Get a specific RFQ by ID
  const getRfqById = (rfqId) => {
    return rfqs.find(rfq => rfq.id === rfqId) || null;
  };

  // Get a specific bid by ID
  const getBidById = (bidId) => {
    return bids.find(bid => bid.id === bidId) || null;
  };

  const value = {
    loading,
    error,
    createRfq,
    submitBid,
    updateBidStatus,
    updateRfqStatus,
    getRfqs,
    getBids,
    getRfqById,
    getBidById
  };

  return (
    <BiddingContext.Provider value={value}>
      {children}
    </BiddingContext.Provider>
  );
}