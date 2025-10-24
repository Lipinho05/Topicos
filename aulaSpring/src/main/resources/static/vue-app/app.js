const { createApp } = Vue;

createApp({
    data() {
        return {
            currentView: 'list',
            pessoas: [],
            selectedPessoa: null,
            loading: false,
            error: null,
            formData: {
                nome: '',
                idade: null
            },
            errors: {}
        }
    },
    methods: {
        // Navegação
        showList() {
            this.currentView = 'list';
            this.loadPessoas();
        },
        showForm() {
            this.currentView = 'form';
            this.resetForm();
        },
        showDetails(pessoa) {
            this.currentView = 'details';
            this.selectedPessoa = pessoa;
        },

        // API Calls
        async loadPessoas() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch('/api/pessoas');
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                this.pessoas = await response.json();
            } catch (error) {
                this.error = `Erro ao carregar pessoas: ${error.message}`;
                console.error('Erro:', error);
            } finally {
                this.loading = false;
            }
        },

        async submitForm() {
            this.loading = true;
            this.errors = {};
            
            try {
                const response = await fetch('/api/pessoas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome: this.formData.nome,
                        idade: parseInt(this.formData.idade)
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
                }

                const novaPessoa = await response.json();
                this.pessoas.push(novaPessoa);
                this.resetForm();
                this.showList();
                alert('Pessoa cadastrada com sucesso!');
                
            } catch (error) {
                this.error = `Erro ao cadastrar pessoa: ${error.message}`;
                console.error('Erro:', error);
            } finally {
                this.loading = false;
            }
        },

        async deletePessoa(id) {
            if (!confirm('Tem certeza que deseja excluir esta pessoa?')) {
                return;
            }

            this.loading = true;
            this.error = null;
            
            try {
                const response = await fetch(`/api/pessoas/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }

                // Remove a pessoa da lista
                this.pessoas = this.pessoas.filter(p => p.id !== id);
                
                // Se estivermos vendo os detalhes da pessoa excluída, volta para a lista
                if (this.currentView === 'details' && this.selectedPessoa && this.selectedPessoa.id === id) {
                    this.showList();
                }
                
                alert('Pessoa excluída com sucesso!');
                
            } catch (error) {
                this.error = `Erro ao excluir pessoa: ${error.message}`;
                console.error('Erro:', error);
            } finally {
                this.loading = false;
            }
        },

        resetForm() {
            this.formData = {
                nome: '',
                idade: null
            };
            this.errors = {};
        }
    },
    mounted() {
        this.loadPessoas();
    }
}).mount('#app');
