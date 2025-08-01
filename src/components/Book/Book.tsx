import "./Book.css";
import { BooksPreviewtate, ImageProps } from "../../types";
import { BaseSyntheticEvent, FC, useCallback, useEffect, useRef } from "react";
import { Button } from "../Button/Button";
import { useBookObserver } from "./useBookObserver";
import { cn } from "../../utils/cn";
import { events } from "../../events";
import { BookProgress } from "./BookProgress";
import { HomeIcon, ImageAddIcon } from "../Icon";

type BookProps = {
  book: BooksPreviewtate;
  onGenerateImageClick: (event: BaseSyntheticEvent) => void;
  isGeneratingImage: boolean;
};

export const Book: FC<BookProps> = (props) => {
  const { book, isGeneratingImage, onGenerateImageClick } = props;
  const bookRef = useRef<HTMLOListElement>(null);
  const { pagesRef, pageIndex, bookProgress, onPageChange } = useBookObserver();

  /**
   * Handle the generated image
   */
  const onBookGenerated = useCallback(async () => {
    if (bookRef.current) {
      bookRef.current.scrollTo({
        left: 0,
        behavior: "instant",
      });
    }
  }, []);

  useEffect(() => {
    events.on("generatedbook", onBookGenerated);
  }, [onBookGenerated]);

  return (
    <section
      id="book"
      data-book-id={String(book.id)}
      data-page-index={String(pageIndex)}
    >
      <BookProgress progress={bookProgress} />

      <ol className="h-scroll book" ref={bookRef}>
        <li className="h-scroll-section page home">
          <h1>{book.title}</h1>
          <Button
            className="home-button"
            data-variant="icon"
            onClick={() => {
              events.emit("home-view", undefined);
            }}
          >
            <HomeIcon />
          </Button>
        </li>

        {(book.pages || []).map((page, i) => (
          <li
            key={i}
            className="h-scroll-section page"
            data-page-index={String(i)}
            ref={(el) => el && (pagesRef.current[i] = el)}
          >
            <p className="page-number">{String(i + 1)}</p>
            {"image" in page &&
            page.image &&
            typeof page.image === "object" &&
            "url" in page.image &&
            (page.image as ImageProps).url ? (
              <figure className="art">
                <img
                  key={`${page.image.url}`}
                  alt={page.synopsis}
                  src={`${page.image.url}`}
                  width={820}
                  height={1030}
                />
              </figure>
            ) : (
              <div className="cta">
                <Button
                  data-page-index={String(i)}
                  onClick={onGenerateImageClick}
                  disabled={isGeneratingImage}
                  className={cn(
                    isGeneratingImage && "loading loading-gradient",
                    "generate-image"
                  )}
                >
                  <ImageAddIcon />
                  Generate Image
                </Button>
              </div>
            )}
            <div className="content">{page.content}</div>
          </li>
        ))}
        <li className="h-scroll-section page last">
          <h3>Fun Fact</h3>
          <p>{book.random_fact}</p>
        </li>
      </ol>

      <nav className="book-nav" style={{ display: "none" }}>
        <button
          onClick={onPageChange}
          data-active={pageIndex}
          data-dir="prev"
          className="prev"
        >
          Prev
        </button>
        <button
          onClick={onPageChange}
          data-active={pageIndex}
          data-dir="next"
          className="next"
        >
          Next
        </button>
      </nav>
    </section>
  );
};
