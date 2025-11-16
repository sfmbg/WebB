document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);
  const data = Object.fromEntries(form.entries());
  const checked = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((c) => c.name);

  // ----------------------
  // ORIENTAČNÍ TRIÁŽ
  // ----------------------
  let priority = "T5";

  // T1 – kritické
  const t1 = [
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
  if (checked.some((c) => t1.includes(c)) || data.b_dychani === "nemohu") {
    priority = "T1";
  }

  // T2
  if (priority === "T5" || priority === "T4" || priority === "T3") {
    if (
      data.b_dychani === "vyrazne" ||
      Number(data.bolest_skala) >= 7 ||
      data.dusnost === "stredni" ||
      checked.includes("c_tep")
    ) {
      priority = "T2";
    }
  }

  // T3
  if (priority === "T5" || priority === "T4") {
    if (Number(data.bolest_skala) >= 4) {
      priority = "T3";
    }
  }

  // T4
  if (priority === "T5") {
    if (Number(data.bolest_skala) >= 1) {
      priority = "T4";
    }
  }

  // ----------------------
  // ČEKACÍ DOBY
  // ----------------------
  const waitTimes = {
    T1: "0 minut – okamžitě",
    T2: "do 10 minut",
    T3: "do 30 minut",
    T4: "60–120 minut",
    T5: "dle vytíženosti (nízká priorita)",
  };

  // ----------------------
  // ZOBRAZENÍ VÝSLEDKU
  // ----------------------
  document.getElementById("triageForm").classList.add("hidden");

  const res = document.getElementById("result");
  res.classList.remove("hidden");

  let danger = "";
  if (priority === "T1") {
    danger =
      "<p style='color:red'><b>Toto může být velmi vážné. Ihned volejte 155 nebo jeďte na urgent.</b></p>";
  } else if (priority === "T2") {
    danger =
      "<p style='color:darkorange'><b>Doporučujeme rychlé vyšetření na urgentním příjmu.</b></p>";
  }

  res.innerHTML = `
    <h2>Odhad naléhavosti: <b>${priority}</b></h2>
    ${danger}
    <p><b>Odhad čekací doby:</b> ${waitTimes[priority]}</p>
    <hr>
    <p><small>Tento nástroj je pouze orientační a nenahrazuje lékařské vyšetření.</small></p>
  `;
  document.getElementById("urgentSelector").classList.remove("hidden");
  loadUrgents();

  // ------------------------------------------
  // Po zobrazení výsledku → zobrazit seznam urgentů
  // ------------------------------------------

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

  // Vyhledávání v reálném čase
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
