export default function CommitteeCard({ committee, onOpen, onClose }) {
  const isOpen = committee.status === "OPEN";

  return (
    <div className="border rounded-xl p-6 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold">{committee.name}</h2>
        <button className="text-gray-500 hover:text-black">✏️</button>
      </div>

      <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
        {committee.type}
      </span>

      <p className="mt-4 text-gray-600">{committee.description}</p>

      <div className="flex justify-between mt-4 text-sm">
        <span>Members: {committee.membersCount}</span>
        <span>Director: {committee.director}</span>
      </div>

      <div className="flex gap-3 mt-6">
        <button className="flex-1 border rounded-lg py-2">View Details</button>

        {isOpen ? (
          <button
            onClick={() => onClose(committee.id)}
            className="px-4 py-2 rounded-lg bg-red-500 text-white"
          >
            Close
          </button>
        ) : (
          <button
            onClick={() => onOpen(committee.id)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white"
          >
            Open
          </button>
        )}
      </div>
    </div>
  );
}
