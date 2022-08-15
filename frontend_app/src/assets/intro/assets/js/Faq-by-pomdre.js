var acc = document.getElementsByClassName("faq");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("on");
    var athis = this;
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight){
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
        for (j = 0; j < acc.length; j++) {
            if (athis !== acc[j]){
                var otherPanel = acc[j].nextElementSibling;
                if (otherPanel.style.maxHeight){
                    acc[j].classList.toggle("on");
                    otherPanel.style.maxHeight = null;
                }
            }
        }
    }
  });
}