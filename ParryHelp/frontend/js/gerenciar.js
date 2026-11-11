(() => {
  const escape = ParryHelp.escapeHTML;
  const productForm = document.querySelector("[data-product-form]");
  const categoryForm = document.querySelector("[data-category-form]");
  let products = [];
  let categories = [];

  function renderProducts() {
    document.querySelector("[data-products-count]").textContent = products.length;
    const list = document.querySelector("[data-products-list]");
    if (!products.length) {
      list.innerHTML = '<p class="manage-empty">Nenhum produto cadastrado.</p>';
      return;
    }

    list.innerHTML = products
      .map((product) => {
        const category = categories.find(
          (item) => Number(item.id) === Number(product.categoria_id),
        );
        return `<article class="manage-item">
          <div class="manage-item-copy">
            <strong>${escape(product.nome)}</strong>
            <span>${escape(category?.nome || "Sem categoria")}</span>
          </div>
          <div class="manage-item-actions">
            <button class="quiet-button" type="button" data-product-edit="${Number(product.id)}">Editar</button>
            <button class="quiet-button manage-delete" type="button" data-product-delete="${Number(product.id)}">Excluir</button>
          </div>
        </article>`;
      })
      .join("");
  }

  function renderCategories() {
    document.querySelector("[data-categories-count]").textContent = categories.length;
    const select = productForm.elements.categoria_id;
    select.innerHTML = categories
      .map(
        (category) =>
          `<option value="${Number(category.id)}">${escape(category.nome)}</option>`,
      )
      .join("");
    select.disabled = !categories.length;

    const list = document.querySelector("[data-categories-list]");
    if (!categories.length) {
      list.innerHTML = '<p class="manage-empty">Nenhuma categoria cadastrada.</p>';
      return;
    }

    list.innerHTML = categories
      .map((category) => {
        const count = products.filter(
          (product) => Number(product.categoria_id) === Number(category.id),
        ).length;
        return `<article class="manage-item">
          <div class="manage-item-copy">
            <strong>${escape(category.nome)}</strong>
            <span>${count} ${count === 1 ? "produto" : "produtos"}</span>
          </div>
          <div class="manage-item-actions">
            <button class="quiet-button" type="button" data-category-edit="${Number(category.id)}">Editar</button>
            <button class="quiet-button manage-delete" type="button" data-category-delete="${Number(category.id)}" ${count ? "disabled title=\"Mova os produtos antes de excluir\"" : ""}>Excluir</button>
          </div>
        </article>`;
      })
      .join("");
  }

  async function load() {
    try {
      [products, categories] = await Promise.all([
        ParryHelp.apiFetch("/produtos"),
        ParryHelp.apiFetch("/categorias"),
      ]);
      renderCategories();
      renderProducts();
    } catch (error) {
      document.querySelector("[data-products-list]").innerHTML =
        `<p class="manage-empty">${escape(error.message)}</p>`;
      document.querySelector("[data-categories-list]").innerHTML =
        `<p class="manage-empty">${escape(error.message)}</p>`;
    }
  }

  function resetProductForm() {
    productForm.reset();
    productForm.elements.id.value = "";
    productForm.querySelector("[data-product-form-title]").textContent = "Novo produto";
    productForm.querySelector("[data-product-submit]").textContent = "Adicionar produto";
    productForm.querySelector("[data-product-cancel]").hidden = true;
    productForm.querySelector("[data-product-error]").textContent = "";
  }

  function resetCategoryForm() {
    categoryForm.reset();
    categoryForm.elements.id.value = "";
    categoryForm.querySelector("[data-category-form-title]").textContent = "Nova categoria";
    categoryForm.querySelector("[data-category-submit]").textContent = "Adicionar categoria";
    categoryForm.querySelector("[data-category-cancel]").hidden = true;
    categoryForm.querySelector("[data-category-error]").textContent = "";
  }

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(productForm));
    const id = Number(data.id);
    const isEditing = Number.isInteger(id) && id > 0;
    const button = productForm.querySelector("[data-product-submit]");
    const error = productForm.querySelector("[data-product-error]");
    button.disabled = true;
    error.textContent = "";
    try {
      await ParryHelp.apiFetch(isEditing ? `/produtos/${id}` : "/produtos", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify({
          nome: data.nome.trim(),
          descricao: data.descricao.trim(),
          categoria_id: Number(data.categoria_id),
          imagem_url: data.imagem_url.trim(),
        }),
      });
      ParryHelp.showToast(isEditing ? "Produto atualizado." : "Produto cadastrado.");
      resetProductForm();
      await load();
    } catch (requestError) {
      error.textContent = requestError.message;
    } finally {
      button.disabled = false;
    }
  });

  categoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(categoryForm));
    const id = Number(data.id);
    const isEditing = Number.isInteger(id) && id > 0;
    const button = categoryForm.querySelector("[data-category-submit]");
    const error = categoryForm.querySelector("[data-category-error]");
    button.disabled = true;
    error.textContent = "";
    try {
      await ParryHelp.apiFetch(isEditing ? `/categorias/${id}` : "/categorias", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify({ nome: data.nome.trim() }),
      });
      ParryHelp.showToast(isEditing ? "Categoria atualizada." : "Categoria cadastrada.");
      resetCategoryForm();
      await load();
    } catch (requestError) {
      error.textContent = requestError.message;
    } finally {
      button.disabled = false;
    }
  });

  document.addEventListener("click", async (event) => {
    const productEdit = event.target.closest("[data-product-edit]");
    if (productEdit) {
      const product = products.find(
        (item) => Number(item.id) === Number(productEdit.dataset.productEdit),
      );
      if (!product) return;
      productForm.elements.id.value = product.id;
      productForm.elements.nome.value = product.nome;
      productForm.elements.descricao.value = product.descricao;
      productForm.elements.categoria_id.value = product.categoria_id;
      productForm.elements.imagem_url.value = product.imagem_url || "";
      productForm.querySelector("[data-product-form-title]").textContent = "Editar produto";
      productForm.querySelector("[data-product-submit]").textContent = "Salvar produto";
      productForm.querySelector("[data-product-cancel]").hidden = false;
      productForm.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const productDelete = event.target.closest("[data-product-delete]");
    if (productDelete) {
      const id = Number(productDelete.dataset.productDelete);
      if (!window.confirm("Excluir este produto e as avaliações associadas?")) return;
      productDelete.disabled = true;
      try {
        await ParryHelp.apiFetch(`/produtos/${id}`, { method: "DELETE" });
        ParryHelp.showToast("Produto excluído.");
        resetProductForm();
        await load();
      } catch (error) {
        ParryHelp.showToast(error.message, true);
        productDelete.disabled = false;
      }
      return;
    }

    const categoryEdit = event.target.closest("[data-category-edit]");
    if (categoryEdit) {
      const category = categories.find(
        (item) => Number(item.id) === Number(categoryEdit.dataset.categoryEdit),
      );
      if (!category) return;
      categoryForm.elements.id.value = category.id;
      categoryForm.elements.nome.value = category.nome;
      categoryForm.querySelector("[data-category-form-title]").textContent = "Editar categoria";
      categoryForm.querySelector("[data-category-submit]").textContent = "Salvar categoria";
      categoryForm.querySelector("[data-category-cancel]").hidden = false;
      categoryForm.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const categoryDelete = event.target.closest("[data-category-delete]");
    if (categoryDelete) {
      const id = Number(categoryDelete.dataset.categoryDelete);
      if (!window.confirm("Excluir esta categoria?")) return;
      categoryDelete.disabled = true;
      try {
        await ParryHelp.apiFetch(`/categorias/${id}`, { method: "DELETE" });
        ParryHelp.showToast("Categoria excluída.");
        resetCategoryForm();
        await load();
      } catch (error) {
        ParryHelp.showToast(error.message, true);
        categoryDelete.disabled = false;
      }
    }
  });

  productForm
    .querySelector("[data-product-cancel]")
    .addEventListener("click", resetProductForm);
  categoryForm
    .querySelector("[data-category-cancel]")
    .addEventListener("click", resetCategoryForm);

  load();
})();
