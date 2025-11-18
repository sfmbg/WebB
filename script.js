document.getElementById("triageForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(this);
  const data = Object.fromEntries(form.entries());
  const checked = Array.from(
    document.querySelectorAll("input[type=checkbox]:checked")
  ).map((c) => c.name);

  // ORIENTAČNÍ TRIÁŽ
  let priority = "ESI5";

  // ESI1 – kritické
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

  // -----------------------
  // ESI2 – UPRAVENO PODLE SCRIPTU A
  // -----------------------
  const ESI2_list = ["dusnost_stredni", "uraz_mech", "c_tep"];

  if (priority === "ESI5" || priority === "ESI4" || priority === "ESI3") {
    if (
      data.b_dychani === "vyrazne" || // výrazné dýchání
      Number(data.bolest_skala) >= 7 || // bolest 7–10
      checked.some((c) => ESI2_list.includes(c)) || // 3 checkboxy
      data.dusnost === "těžká" // těžká dušnost
    ) {
      priority = "ESI2";
    }
  }

  // -----------------------
  // ESI3 – UPRAVENO PODLE SCRIPTU A
  // -----------------------
  if (priority === "ESI5" || priority === "ESI4") {
    if (
      Number(data.bolest_skala) >= 4 || // bolest 4–6
      data.dusnost === "střední" // střední dušnost
    ) {
      priority = "ESI3";
    }
  }

  // ESI4
  if (priority === "ESI5") {
    if (Number(data.bolest_skala) >= 1) {
      priority = "ESI4";
    }
  }

  // ČEKACÍ DOBY
  const waitTimes = {
    ESI1: "0 minut – okamžitě",
    ESI2: "do 10 minut",
    ESI3: "do 30 minut",
    ESI4: "60–120 minut",
    ESI5: "dle vytíženosti (nízká priorita)",
  };

  // ZOBRAZENÍ VÝSLEDKU
  document.getElementById("triageForm").classList.add("hidden");

  const res = document.getElementById("result");
  res.classList.remove("hidden");

  let danger = "";
  if (priority === "ESI1") {
    danger =
      "<p style='color:red'><b>Toto může být velmi vážné. Zvažte volání na 155 nebo jeďte na urgent.</b></p>";
  } else if (priority === "ESI2") {
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

  // Po zobrazení výsledku → zobrazit seznam urgentů
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
