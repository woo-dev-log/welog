const Scroll = () => {
    const boardTopBlock = document.querySelector(".board-topBlock") as HTMLElement;
    const boardArticle = document.querySelector(".board-article") as HTMLElement;
    if (boardTopBlock) {
        const TopBlockOffsetTop = boardTopBlock.offsetTop;
        window.scrollTo({ top: TopBlockOffsetTop - 80, behavior: "smooth" });
    } else if (boardArticle) {
        const ArticleOffsetTop = boardArticle.offsetTop;
        window.scrollTo({ top: ArticleOffsetTop - 80, behavior: "smooth" });
    }
}

export default Scroll;