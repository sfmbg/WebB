document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);
  const data = Object.fromEntries(form.entries());
  const checked = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((c) => c.name);

  // INTENZITA
  const bolest = Number(data.bolest_intenzita);

  // VÝCHOZÍ PRIORITA
  let priority = "ESI5";

  // --------------------
  // ESI 1 – KRITICKÉ
  // --------------------
  const ESI1 = [
    "a_duch",
    "a_otok",
    "b_modrani",
    "c_krvaceni",
    "c_hrudnik",
    "d_vedomi",
    "d_krece",
    "neuro_koutek",
    "neuro_rec",
    "neuro_videni",
    "neuro_vedomi",
  ];

  if (checked.some((c) => ESI1.includes(c)) || data.b_dychani === "nemohu") {
    priority = "ESI1";
  }

  // --------------------
  // ESI 2 – VELMI URGENTNÍ
  // --------------------
  const ESI2_list = ["c_tep", "uraz_krvaceni", "uraz_zlomenina"];

  if (priority === "ESI5" || priority === "ESI4" || priority === "ESI3") {
    if (
      data.b_dychani === "vyrazne" ||
      bolest >= 7 ||
      data.dusnost === "těžká" ||
      checked.some((c) => ESI2_list.includes(c))
    ) {
      priority = "ESI2";
    }
  }

  // --------------------
  // ESI 3 – URGENTNÍ
  // --------------------
  if (priority === "ESI5" || priority === "ESI4") {
    if (bolest >= 4 || data.dusnost === "střední") {
      priority = "ESI3";
    }
  }

  // --------------------
  // ESI 4 – MÉNĚ URGENTNÍ
  // --------------------
  if (priority === "ESI5") {
    if (bolest >= 1) {
      priority = "ESI4";
    }
  }

  // ČEKACÍ DOBY
  const waitTimes = {
    ESI1: "0 minut – okamžitě",
    ESI2: "do 10 minut",
    ESI3: "do 60 minut",
    ESI4: "do 120 minut",
    ESI5: "do 6 hodin",
  };

  // SCHOVAT FORMULÁŘ
  document.getElementById("triageForm").classList.add("hidden");

  const res = document.getElementById("result");
  res.classList.remove("hidden");

  let danger = "";
  if (priority === "ESI1") {
    danger = `<p style='color:red'><b>Toto může být velmi vážné. Zvažte volání na 155 nebo jeďte na urgent.</b></p>`;
  } else if (priority === "ESI2") {
    danger = `<p style='color:darkorange'><b>Doporučujeme rychlé vyšetření na urgentním příjmu.</b></p>`;
  }

  res.innerHTML = `
    <h2>Odhad naléhavosti: <b>${priority}</b></h2>
    ${danger}
    <p><b>Odhad čekací doby:</b> ${waitTimes[priority]}</p>
    <hr>
    <p><i><small>Tento nástroj je pouze orientační a nenahrazuje vyšetření lékařem.</small></i></p>
  `;

  // --------------------
  // URGENTY – načítání
  // --------------------
  document.getElementById("urgentSelector").classList.remove("hidden");
  loadUrgents();

  function loadUrgents() {
    fetch("urgenty.json")
      .then((r) => r.json())
      .then((data) => {
        window.URGENTY = data;
        renderUrgentList(data);
      });
  }

  function renderUrgentList(list) {
    const container = document.getElementById("urgentList");
    container.innerHTML = "";

    list.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("urgent-item");

      div.innerHTML = `
        <b>${item.name}</b><br>
        ${item.address}<br>
        Tel: ${item.phone}<br>
        <a href="${item.url}" target="_blank">Otevřít web</a>
      `;
      container.appendChild(div);
    });
  }

  // FILTRACE
  document
    .getElementById("urgentSearch")
    ?.addEventListener("input", function () {
      const q = this.value.toLowerCase();

      const filtered = window.URGENTY.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q)
      );

      renderUrgentList(filtered);
    });
});
