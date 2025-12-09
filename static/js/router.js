const AppRouter = {
    init: () => {
        AppRouter.navegar('dashboard');
    },

    navegar: (rota, param = null) => {
        // Atualiza Menu Visual
        AppRouter.atualizarMenu(rota);

        // Roteamento Simples
        switch(rota) {
            case 'dashboard':
                DashboardController.render();
                break;
            case 'meus_processos':
                DFDController.renderList();
                break;
            case 'novo_dfd':
                DFDController.renderForm();
                break;
            case 'editar_dfd':
                DFDController.renderForm(param); // param aqui é o ID
                break;
            case 'etp':
                ETPController.preparar(param); // param aqui é o dfd_id
                break;
            default:
                console.error("Rota desconhecida:", rota);
        }
    },

    atualizarMenu: (nomeRota) => {
        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
        // Mapeamento simples de Rota -> Texto do Menu
        const mapa = {
            'dashboard': 'Dashboard',
            'novo_dfd': 'Novo DFD',
            'meus_processos': 'Meus Processos'
        };
        const textoLink = mapa[nomeRota] || 'Meus Processos'; // fallback
        
        const links = document.querySelectorAll('.sidebar a');
        for(let link of links) {
            if(link.innerText.includes(textoLink)) link.classList.add('active');
        }
    }
};