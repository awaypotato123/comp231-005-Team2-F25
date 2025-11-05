export default function ClassCard({ title, instructor, cost, rating }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">by {instructor}</p>
      <div className="mt-3 flex justify-between items-center">
        <span className="font-bold text-blue-600">${cost}</span>
        <span className="text-yellow-500">★ {rating}</span>
      </div>
      <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        Join Class
      </button>
    </div>
  );
}
