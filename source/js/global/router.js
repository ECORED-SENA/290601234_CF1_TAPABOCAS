// Base route
const baseRoutes = 'page';

$(document).ready(() => {
  const functionModule = {
    showContent() {
      //if (this.slug == 'glosario' || this.slug == 'glossary') { renderGlossary(this.slug); } else { renderContent(this.slug); }
      renderContent(this.slug);
    },
    anchor() {
      //if (this.slug == 'glosario' || this.slug == 'glossary') { renderGlossary(this.slug); } else { renderContent(this.slug, this.anchor); }
      renderContent(this.slug, this.anchor);
    }
  };
    // Write ur urls here

  // Base route
  $.routes.add(`${baseRoutes}/{ slug }#{ anchor }`, 'anchor', functionModule.anchor);
  $.routes.add(`${baseRoutes}/{ slug }`, 'path', functionModule.showContent);
});
