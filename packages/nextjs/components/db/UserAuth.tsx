import { useEffect, useState } from "react";
import { PaymentDetail, PrivyData, db, testRedisConnection } from "~~/utils/upstash_db";

interface User {
  _id: string;
  payed: boolean;
  privy: PrivyData;
  payments: PaymentDetail[];
}

const UserAuth = () => {
  const [readId, setReadId] = useState("");
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);

  useEffect(() => {
    // Test the Redis connection on component mount
    testRedisConnection();
  }, []);

  const handleRead = async () => {
    try {
      const userData = await db.readUser(readId);
      setFetchedUser(userData);
    } catch (error) {
      console.error("Error reading user:", error);
    }
  };

  return (
    <div className="p-6 bg-base-100 border border-base-300 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">UserAuth Database widget</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Privy ID"
          value={readId}
          onChange={e => setReadId(e.target.value)}
          className="input input-bordered w-full"
        />
        <button onClick={handleRead} className="btn btn-secondary w-full">
          Read User
        </button>
      </div>

      {fetchedUser && (
        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Fetched User:</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">ID:</span> {fetchedUser._id}
            </p>
            <p>
              <span className="font-medium">Payed:</span> {fetchedUser.payed ? "Yes" : "No"}
            </p>
            <div className="mt-4 p-4 bg-base-300 rounded-lg">
              <p className="font-medium mb-2">Debug Data:</p>
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(fetchedUser, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAuth;
