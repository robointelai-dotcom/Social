type LoaderSize = "small" | "medium" | "large";

const Loader = ({ size }: { size: LoaderSize }) => {
  if (size === "small") {
    return (
      <div className="inset flex items-center justify-center">
        <div className="border-4 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  } else if (size === "medium") {
    return (
      <div className="w-24 h-24 border-primary border-4 border-t-transparent rounded-full animate-spin" />
    );
  } else if (size === "large") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-24 h-24 border-primary border-4 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
};

export default Loader;
