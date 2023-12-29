const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;

  if (!items || items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);

  // Move const list here
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={() => onPageChange(page)} className="page-item">
        {page}
      </Button>
    );
  });

  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

const paginate = (items, pageNumber, pageSize) => {
  const start = (pageNumber - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

const useDataApi = (initialUrl, initialData, query) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(`${url}/search?query=${query}&format=json`);
        console.log("API Result:", result.data); 
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };

    fetchData(); // Call fetchData function

    return () => {
      didCancel = true;
    };
  }, [url, query]);

  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: {hits: action.payload},
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

function App() {
  const { Fragment, useState } = React;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://www.colourlovers.com/api/palettes/hueOption/search?query=color&format=json",
    {
      hits: [],
    }
  );
  const [query, setQuery] = useState("color palette");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  let page = data.hits;
  if (page && page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  return (
    <Fragment>
      <form
        onSubmit={(event) => {
          doFetch(
            `http://www.colourlovers.com/api/palettes/search?query=${query}&format=json`
          );
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {!isLoading && (
        <ul>
          {page?.map((item) => (
            <li key={item.id}>
              <div>
                <strong>Title:</strong> {item.title}
              </div>
              <div>
                <strong>User Name:</strong> {item.userName}
              </div>
              <div>
                <strong>Colors:</strong>{" "}
                {item.colors.map((color, index) => (
                  <span key={index} style={{ backgroundColor: `#${color}` }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                ))}
              </div>
              <a href={item.url}>View Palette</a>
            </li>
          ))}
        </ul>
      )}


      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

