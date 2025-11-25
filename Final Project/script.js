const files = Array.from(document.querySelectorAll('.file'));
let locked = false;

function resetTransforms() {
  files.forEach(f => f.style.transform = '');
}

// Click behavior
files.forEach((file, index) => {
  file.addEventListener('click', e => {
    e.stopPropagation();

    if (locked && !file.classList.contains('active')) return;

    // Clicking active file closes it
    if (file.classList.contains('active')) {
      file.classList.remove('active');
      locked = false;
      resetTransforms();
      return;
    }

    // Set active file
    files.forEach(f => f.classList.remove('active'));
    file.classList.add('active');
    locked = true;

    const drawerFront = document.querySelector('.drawer-front');
    const drawerRect = drawerFront.getBoundingClientRect();

    const MAX_DOWN_SHIFT = 200;
    const MIN_DOWN_SHIFT = 1;

    const totalFiles = files.length;
    const backProportion = (totalFiles - 1 - index) / (totalFiles - 1);
    const intendedShift = MIN_DOWN_SHIFT + backProportion * (MAX_DOWN_SHIFT - MIN_DOWN_SHIFT);

    files.forEach((f, i) => {
      if (i > index) {
        const fileRect = f.getBoundingClientRect();
        const drawerBottom = drawerRect.bottom;
        const maxDown = drawerBottom - fileRect.bottom;
        const finalShift = Math.min(intendedShift, maxDown);

        f.style.transition = 'transform 0.4s ease';
        f.style.transform = `translateY(${finalShift}px)`;
      } else if (i === index) {
        const fileRect = f.getBoundingClientRect();
        let lift = fileRect.top - 30;
        if (lift < 0) lift = 0;
        f.style.transition = 'transform 0.3s ease';
        f.style.transform = `translateY(${-lift}px)`;
      } else {
        f.style.transform = '';
      }
    });
  });
});


// Hover lift
files.forEach(file => {
  file.addEventListener('mouseenter', () => {
    if (locked) return;
    file.style.transform = 'translateY(-6px)';
  });
  file.addEventListener('mouseleave', () => {
    if (locked) return;
    file.style.transform = '';
  });
});

const handle = document.querySelector('.handle');
let stacked = false;

handle.addEventListener('click', e => {
  e.stopPropagation();

  const drawerFront = document.querySelector('.drawer-front');
  const filesContainer = document.querySelector('.files');

  if (!stacked) {
    // Disable file interactions
    filesContainer.style.pointerEvents = 'none';

    // Stack files
    files.forEach((file, index) => {
      if (index === 0) return;
      const backRect = files[0].getBoundingClientRect();
      const fileRect = file.getBoundingClientRect();
      const offset = backRect.bottom - fileRect.bottom;
      file.style.transition = 'transform 0.5s ease';
      file.style.transform = `translateY(${offset}px)`;
    });

    // Move drawer up AND increase height
    drawerFront.style.transition = 'transform 0.5s ease, height 0.11s ease';
    drawerFront.style.transform = 'translateY(-70%)';
    drawerFront.style.height = '55vh'; // increased height when opened

    stacked = true;
  } else {
    // Enable file interactions
    filesContainer.style.pointerEvents = 'auto';

    // Unstack files
    files.forEach(file => {
      file.style.transition = 'transform 0.4s ease';
      file.style.transform = '';
    });

    // Move drawer back down AND restore original height
    drawerFront.style.transition = 'transform 0.3s ease, height 0.7s ease';
    drawerFront.style.transform = 'translateY(0)';
    drawerFront.style.height = '46vh'; // restore original height

    stacked = false;
  }
});

let activeFile = null;

// Lift amount in px
const LIFT_AMOUNT = 40;

// click behavior
files.forEach((file, index) => {
  // store original z-index if not already stored
  if (!file.dataset.index) file.dataset.index = index;

  file.addEventListener('dblclick', (e) => {
    e.stopPropagation();

    // === If this file is already active → send it back ===
    if (activeFile === file) {
      resetFiles();
      activeFile = null;
      return;
    }

    // === Otherwise, activate this file ===
    files.forEach(f => {
      f.style.zIndex = f.dataset.index;
      f.style.transform = 'translateY(0) scale(1)';
    });

    // bring clicked file to the front + lift it
    file.style.zIndex = files.length;
    file.style.transform = `translateY(${LIFT_AMOUNT}px) scale(1.05)`;

    activeFile = file;
  });
});

// clicking outside resets everything
document.addEventListener('click', () => {
  if (activeFile) {
    resetFiles();
    activeFile = null;
  }
});

// helper
function resetFiles() {
  files.forEach(f => {
    f.style.zIndex = f.dataset.index;
    f.style.transform = 'translateY(0) scale(1)';
  });
}



// Click outside to reset
document.addEventListener('click', () => {
  if (!locked) return;
  files.forEach(f => f.classList.remove('active'));
  resetTransforms();
  locked = false;
});