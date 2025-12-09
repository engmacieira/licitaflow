const DashboardController = {
    render: async () => {
        const app = document.getElementById('app-content');
        const dfds = await API.dfd.listar();
        const qtd = dfds ? dfds.length : 0;

        app.innerHTML = `
            <div class="container fade-in">
                <h2>📊 Dashboard</h2>
                <hr>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card text-white bg-success mb-3">
                            <div class="card-header">Total de Processos</div>
                            <div class="card-body">
                                <h1 class="card-title">${qtd}</h1>
                                <p class="card-text">DFDs registrados.</p>
                            </div>
                        </div>
                    </div>
                     <div class="col-md-8">
                        <div class="card">
                            <div class="card-header">Acesso Rápido</div>
                            <div class="card-body">
                                <button onclick="AppRouter.navegar('novo_dfd')" class="btn btn-primary btn-lg">
                                    + Criar Novo DFD
                                </button>
                                <button onclick="AppRouter.navegar('meus_processos')" class="btn btn-outline-primary btn-lg ms-2">
                                    📁 Ver Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};