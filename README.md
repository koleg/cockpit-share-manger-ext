# Samba Share Manager for EXT Filesystem

A modern, Cockpit-based plugin to manage Samba shares with a focus on ease of use and integration with EXT filesystem project quotas. This tool provides a central, user-friendly interface to view, add, edit, and delete Samba share configurations.

![Samba Share Manager Screenshot](https://user-images.githubusercontent.com/12345/samba-manager-screenshot.png) 
*(Note: Screenshot is a placeholder and should be replaced with an actual image of the running application.)*

---

## ✨ Key Features

- **Intuitive Share Management**: A clean, responsive interface for all CRUD (Create, Read, Update, Delete) operations on your Samba shares.
- **Project Quota Integration**: Directly set, view, and manage disk space quotas for each share, leveraging the power of EXT filesystem project quotas.
- **Real-time Usage Monitoring**: See the current disk space used by each share at a glance.
- **Filesystem Overview**: A header widget displays the total size, available space, and usage of the parent filesystem.
- **Advanced Configuration**: An optional, toggleable section allows for adding raw `smb.conf` parameters to any share for advanced use cases.
- **Dynamic Sorting & Filtering**: Easily sort shares by name, path, quota size, or space used.
- **Theming**: Switch between a sleek dark mode and a clean light mode to match your Cockpit environment.
- **Safe & Centralized Management**: Manages share configurations in individual files within a dedicated directory, keeping your main `smb.conf` clean and easy to manage.
- **Auto-Setup**: A one-click process to automatically configure your `smb.conf` to include the shares managed by this plugin.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Cockpit JS API (`cockpit.spawn`)
- **System Dependencies**: Samba, Quota Tools (`repquota`, `setquota`)

## ⚙️ How It Works

This application is a **Cockpit plugin**, meaning it runs directly within your server's Cockpit interface. It communicates with the underlying system using the `cockpit.spawn` API to execute shell commands securely.

- **Share Configuration**: Instead of modifying `/etc/samba/smb.conf` directly, the plugin creates a separate `.conf` file for each share (e.g., `my_share.conf`) inside a configurable directory (default: `/etc/cockpit/zfs/shares/`). It then adds an `include` directive to `smb.conf` to load all of these files. This approach makes management cleaner and less error-prone.
- **Quota Management**: The plugin uses the standard Linux `setquota` and `repquota` commands to manage disk space limits. It maps each share's directory path to a unique "project name" and uses EXT filesystem project quotas to enforce the limits.
- **Settings**: Plugin-specific settings, like default paths and the selected theme, are stored in `/etc/samba/smm.cfg`.

## 📋 Prerequisites

Before installing, ensure your server meets the following requirements:

1.  **Cockpit**: A running instance of Cockpit.
2.  **Samba**: Samba server must be installed and running.
3.  **EXT Filesystem with Project Quotas**: The filesystem where your shares will reside (e.g., `/srv/`) must be an EXT variant (like ext4) and must be mounted with project quota support enabled.
    -   Check your `/etc/fstab` file. The mount options for the filesystem should include `prjquota`.
    -   Example `fstab` entry: `UUID=... /srv ext4 defaults,prjquota 0 2`
4.  **Quota Tools**: The `quota` package must be installed, which provides the `setquota` and `repquota` utilities.

## 🚀 Installation

1.  **Download the Plugin**: Clone this repository or download the source code as a ZIP file.
2.  **Place in Cockpit Directory**: Copy the entire project directory (`samba-share-manager`) to one of the Cockpit plugin locations:
    -   For a single user: `~/.local/share/cockpit/`
    -   For all users on the system: `/usr/share/cockpit/`
3.  **Reload Cockpit**: Log out and log back into Cockpit, or refresh your browser page.
4.  **Navigate to the Plugin**: You should see a new "EXT Share Manager" tab in the Cockpit side menu.

## 🔧 Configuration

1.  **First-Time Setup**: When you first open the plugin, if your `smb.conf` is not already set up to include the manager's configuration, you will see a prompt. Click **"Enable Now"** to have the plugin automatically add the required `include` directive.
2.  **Review Settings**: Click the **"Settings"** button in the header.
    -   **Share Configuration Base Path**: Verify the path where share `.conf` files will be stored.
    -   **Default Parent Path / Mountpoint**: Adjust the default paths that are suggested when you create a new share.
    -   **Theme**: Choose your preferred theme.
3.  **Enable Quotas on Filesystem**: After ensuring `prjquota` is in your `fstab`, you may need to run these commands once on the filesystem mountpoint (e.g., `/srv`):
    ```bash
    sudo quotacheck -cugm /srv
    sudo quotaon -P /srv
    ```

You are now ready to start adding and managing shares!

## 💻 Development

Interested in contributing? Here’s how to get a development environment running:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/samba-share-manager.git
    cd samba-share-manager
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run the Dev Server**:
    ```bash
    npm run dev
    ```
    This will start the Vite development server. The project includes a mock `cockpit.js` service, allowing you to develop and test the UI in your local browser without needing a live Cockpit instance. All backend calls are mocked in `services/sambaService.ts`.

4.  **Build for Production**:
    When you are ready to deploy your changes, run the build command:
    ```bash
    npm run build
    ```
    This will compile the TypeScript and React code into a production-ready `dist` folder, which is what you would copy to your Cockpit plugins directory.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
