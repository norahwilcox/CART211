// Collects all .file elements 
const files = Array.from(document.querySelectorAll('.file'));

// Only one file can be interacted with at a time
let locked = false;

function resetTransforms() {
  files.forEach(f => f.style.transform = '');
}

// Click behavior
files.forEach((file, index) => {
  file.addEventListener('click', e => {
    e.stopPropagation();

    // If a file is active, ignore clicks on other files
    if (locked && !file.classList.contains('active')) return;

    // Clicking active file closes it
    if (file.classList.contains('active')) {
      file.classList.remove('active');
      locked = false;
      resetTransforms();
      return;
    }

    // Sets active file
    files.forEach(f => f.classList.remove('active'));
    file.classList.add('active');
    locked = true;

    // Files don’t overlap the drawer front
    const drawerFront = document.querySelector('.drawer-front');
    const drawerRect = drawerFront.getBoundingClientRect();

    // Amount files shift when another is clicked 
    const MAX_DOWN_SHIFT = 200; // drawers furthest away
    const MIN_DOWN_SHIFT = 1; // drawers closest

    const totalFiles = files.length;

    // How far back the file is in the stack
    const backProportion = (totalFiles - 1 - index) / (totalFiles - 1);
    const intendedShift = MIN_DOWN_SHIFT + backProportion * (MAX_DOWN_SHIFT - MIN_DOWN_SHIFT);

    // Apply transform to every file
    files.forEach((f, i) => {
      // Push down the files in front of the active file
      if (i > index) {
        const fileRect = f.getBoundingClientRect();
        const drawerBottom = drawerRect.bottom;
        // Prevent pushing file below drawer front
        const maxDown = drawerBottom - fileRect.bottom;
        const finalShift = Math.min(intendedShift, maxDown);

        f.style.transition = 'transform 0.4s ease'; // how long the lift animation lasts
        f.style.transform = `translateY(${finalShift}px)`;

        // Active file lifts upwards
      } else if (i === index) {
        const fileRect = f.getBoundingClientRect();
        let lift = fileRect.top - 30;
        if (lift < 0) lift = 0;
        f.style.transition = 'transform 0.3s ease';
        f.style.transform = `translateY(${-lift}px)`;

        // Files in front stay in place 
      } else {
        f.style.transform = '';
      }
    });
  });
});

// Clicking outside to resets
document.addEventListener('click', () => {
  if (!locked) return;
  files.forEach(f => f.classList.remove('active'));
  resetTransforms();
  locked = false;
});

// Hover lift when the mouse passes over
files.forEach(file => {
  file.addEventListener('mouseenter', () => {
    // Disabled when file is locked
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

// Pushes the drawer in when the handle is clicked
handle.addEventListener('click', e => {
  e.stopPropagation();

  const drawerFront = document.querySelector('.drawer-front');
  const filesContainer = document.querySelector('.files');

  if (!stacked) {
    // Disables file interactions
    filesContainer.style.pointerEvents = 'none';

    // Stacks files
    files.forEach((file, index) => {
      // first file stays 
      if (index === 0) return; 
      const backRect = files[0].getBoundingClientRect();
      const fileRect = file.getBoundingClientRect();
      const offset = backRect.bottom - fileRect.bottom;
      file.style.transition = 'transform 0.5s ease';
      file.style.transform = `translateY(${offset}px)`;
    });

    // Moves drawer up and increase height
    drawerFront.style.transition = 'transform 0.5s ease, height 0.11s ease'; // length of transition
    drawerFront.style.transform = 'translateY(-70%)';
    drawerFront.style.height = '55vh'; // increases height of drawer when closed

    stacked = true;

  } else {
    // Enables file interactions when pulled back out
    filesContainer.style.pointerEvents = 'auto';

    // Unstacks files
    files.forEach(file => {
      file.style.transition = 'transform 0.4s ease'; // length of transition
      file.style.transform = '';
    });

    // Move drawer back down and restores original height
    drawerFront.style.transition = 'transform 0.3s ease, height 0.7s ease';
    drawerFront.style.transform = 'translateY(0)';
    drawerFront.style.height = '46vh';

    stacked = false;
  }
});

let activeFile = null;

// Double click lift amount in px
const LIFT_AMOUNT = 40;

// Double click behavior
files.forEach((file, index) => {
  // Stores original z-index of the file 
  if (!file.dataset.index) file.dataset.index = index;

  file.addEventListener('dblclick', (e) => {
    e.stopPropagation();

    // Sends file back if it is is already active  
    if (activeFile === file) {
      resetFiles();
      activeFile = null;
      return;
    }

    // If not, activates the file 
    files.forEach(f => {
      f.style.zIndex = f.dataset.index;
      f.style.transform = 'translateY(0) scale(1)';
    });

    // bring clicked file to the front and lifts it
    file.style.zIndex = files.length;
    file.style.transform = `translateY(${LIFT_AMOUNT}px) scale(1.05)`; // How big the file is when clicked

    activeFile = file;
  });
});

// Clicking outside resets everything
document.addEventListener('click', () => {
  if (activeFile) {
    resetFiles();
    activeFile = null;
  }
});

// Double clicking and clicking elsewhere resets everything
function resetFiles() {
  files.forEach(f => {
    f.style.zIndex = f.dataset.index;
    f.style.transform = 'translateY(0) scale(1)';
  });
}