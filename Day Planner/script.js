// script.js for Day Planner

document.addEventListener('DOMContentLoaded', function() {
    // Show planner on Get Started click
    const getStartedBtn = document.getElementById('get-started-btn');
    const introSection = document.getElementById('intro-section');
    const plannerSection = document.getElementById('planner-section');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            introSection.style.display = 'none';
            plannerSection.style.display = 'block';
        });
    }

    const form = document.getElementById('planner-form');
    const taskList = document.getElementById('task-list');
    const tasks = [];

    // Request notification permission
    if (Notification && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const task = document.getElementById('task').value;
        const time = document.getElementById('time').value;
        if (task && time) {
            addTask(task, time);
            form.reset();
        }
    });

    function addTask(task, time) {
        const li = document.createElement('li');
        li.textContent = `${task} at ${time}`;
        // Add delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'delete-btn';
        delBtn.onclick = function() {
            li.remove();
            // Remove from tasks array
            const idx = tasks.findIndex(t => t.task === task && t.time === time);
            if (idx > -1) {
                tasks.splice(idx, 1);
                saveTasks(); // Save after delete
            }
        };
        li.appendChild(delBtn);
        taskList.appendChild(li);
        tasks.push({ task, time });
        saveTasks(); // Save after add
        scheduleNotification(task, time);
    }

    function scheduleNotification(task, time) {
        const now = new Date();
        const [hours, minutes] = time.split(':');
        const notifyTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        const delay = notifyTime - now;
        if (delay > 0) {
            setTimeout(() => {
                // Show a custom in-page notification
                showCustomNotification(`It's time for: <b>${task}</b>`);
                // Also use browser notification if allowed
                if (Notification && Notification.permission === 'granted') {
                    const n = new Notification('Day Planner Reminder', {
                        body: `It's time for: ${task}`
                    });
                    if (navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                    }
                } else {
                    if (navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                    }
                }
            }, delay);
        }
    }

    // Custom in-page notification
    function showCustomNotification(message) {
        let notif = document.getElementById('custom-notif');
        if (!notif) {
            notif = document.createElement('div');
            notif.id = 'custom-notif';
            notif.style.position = 'fixed';
            notif.style.top = '32px';
            notif.style.left = '50%';
            notif.style.transform = 'translateX(-50%)';
            notif.style.background = '#3730a3';
            notif.style.color = '#fff';
            notif.style.fontFamily = "'Segoe UI', Arial, sans-serif";
            notif.style.fontSize = '1.2rem';
            notif.style.padding = '18px 36px';
            notif.style.borderRadius = '12px';
            notif.style.boxShadow = '0 4px 24px rgba(55,48,163,0.15)';
            notif.style.zIndex = '9999';
            notif.style.display = 'none';
            document.body.appendChild(notif);
        }
        notif.innerHTML = message;
        notif.style.display = 'block';
        setTimeout(() => {
            notif.style.display = 'none';
        }, 5000);
    }

    // Optional: Save/load tasks from localStorage
    function saveTasks() {
        localStorage.setItem('dayPlannerTasks', JSON.stringify(tasks));
    }
    function loadTasks() {
        const saved = localStorage.getItem('dayPlannerTasks');
        if (saved) {
            // Clear current tasks and UI
            tasks.length = 0;
            taskList.innerHTML = '';
            JSON.parse(saved).forEach(t => addTask(t.task, t.time));
        }
    }
    // Save tasks on add/delete
    const origAddTask = addTask;
    addTask = function(task, time) {
        origAddTask(task, time);
        saveTasks();
    };
    // Load tasks on page load
    loadTasks();
});
