""" 
lab_utils_uni.py
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from matplotlib.gridspec import GridSpec
from matplotlib.colors import LinearSegmentedColormap
from ipywidgets import interact
from lab_utils_common import compute_cost
from lab_utils_common import dlblue, dlorange, dldarkred, dlmagenta, dlpurple, dlcolors
import plotly.graph_objects as go
from plotly.subplots import make_subplots

plt.style.use('./leonteq.mplstyle')
n_bin = 5
dlcm = LinearSegmentedColormap.from_list(
        'dl_map', dlcolors, N=n_bin)

##########################################################
# Plotting Routines
##########################################################

def plt_house_x(X, y,f_wb=None, ax=None):
    ''' plot house with aXis '''
    if not ax:
        fig, ax = plt.subplots(1,1)
    ax.scatter(X, y, marker='x', c='r', label="Actual Value")

    ax.set_title("Housing Prices")
    ax.set_ylabel('Price (in 1000s of chf)')
    ax.set_xlabel(f'Size (100 m2)')
    if f_wb is not None:
        ax.plot(X, f_wb,  c=dlblue, label="Our Prediction")
    ax.legend()


def mk_cost_lines(x,y,w,b, ax):
    ''' makes vertical cost lines'''
    cstr = "cost = (1/m)*("
    ctot = 0
    label = 'cost for point'
    addedbreak = False
    for p in zip(x,y):
        f_wb_p = w*p[0]+b
        c_p = ((f_wb_p - p[1])**2)/2
        c_p_txt = c_p
        ax.vlines(p[0], p[1],f_wb_p, lw=3, color=dlpurple, ls='dotted', label=label)
        label='' #just one
        cxy = [p[0], p[1] + (f_wb_p-p[1])/2]
        ax.annotate(f'{c_p_txt:0.0f}', xy=cxy, xycoords='data',color=dlpurple,
            xytext=(5, 0), textcoords='offset points')
        cstr += f"{c_p_txt:0.0f} +"
        if len(cstr) > 38 and addedbreak is False:
            cstr += "\n"
            addedbreak = True
        ctot += c_p
    ctot = ctot/(len(x))
    cstr = cstr[:-1] + f") = {ctot:0.0f}"
    ax.text(0.15,0.02,cstr, transform=ax.transAxes, color=dlpurple)

##########
# Cost lab
##########


def plt_intuition(x_train, y_train):

    w_range = np.array([200-200,200+200])
    tmp_b = 100

    w_array = np.arange(*w_range, 5)
    cost = np.zeros_like(w_array)
    for i in range(len(w_array)):
        tmp_w = w_array[i]
        cost[i] = compute_cost(x_train, y_train, tmp_w, tmp_b)

    @interact(w=(*w_range,10),continuous_update=False)
    def func( w=150):
        f_wb = np.dot(x_train, w) + tmp_b

        fig, ax = plt.subplots(1, 2, constrained_layout=True, figsize=(8,4))
        fig.canvas.toolbar_position = 'bottom'

        mk_cost_lines(x_train, y_train, w, tmp_b, ax[0])
        plt_house_x(x_train, y_train, f_wb=f_wb, ax=ax[0])

        ax[1].plot(w_array, cost)
        cur_cost = compute_cost(x_train, y_train, w, tmp_b)
        ax[1].scatter(w,cur_cost, s=100, color=dldarkred, zorder= 10, label= f"cost at w={w}")
        ax[1].hlines(cur_cost, ax[1].get_xlim()[0],w, lw=4, color=dlpurple, ls='dotted')
        ax[1].vlines(w, ax[1].get_ylim()[0],cur_cost, lw=4, color=dlpurple, ls='dotted')
        ax[1].set_title("Cost vs. w, (b fixed at 100)")
        ax[1].set_ylabel('Cost')
        ax[1].set_xlabel('w')
        ax[1].legend(loc='upper center')
        fig.suptitle(f"Minimize Cost: Current Cost = {cur_cost:0.0f}", fontsize=12)
        plt.show()

# this is the 2D cost curve with interactive slider
def plt_stationary(x_train, y_train):
    # setup figure
    fig = plt.figure( figsize=(9,8))
    #fig = plt.figure(constrained_layout=True,  figsize=(12,10))
    fig.set_facecolor('#ffffff') #white
    fig.canvas.toolbar_position = 'top'
    #gs = GridSpec(2, 2, figure=fig, wspace = 0.01)
    gs = GridSpec(2, 2, figure=fig)
    ax0 = fig.add_subplot(gs[0, 0])
    ax1 = fig.add_subplot(gs[0, 1])
    ax2 = fig.add_subplot(gs[1, :],  projection='3d')
    ax = np.array([ax0,ax1,ax2])

    #setup useful ranges and common linspaces
    w_range = np.array([200-300.,200+300])
    b_range = np.array([50-300., 50+300])
    b_space  = np.linspace(*b_range, 100)
    w_space  = np.linspace(*w_range, 100)

    # get cost for w,b ranges for contour and 3D
    tmp_b,tmp_w = np.meshgrid(b_space,w_space)
    z=np.zeros_like(tmp_b)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i,j] = compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j] )
            if z[i,j] == 0: z[i,j] = 1e-6

    w0=200;b=-100    #initial point
    ### plot model w cost ###
    f_wb = np.dot(x_train,w0) + b
    mk_cost_lines(x_train,y_train,w0,b,ax[0])
    plt_house_x(x_train, y_train, f_wb=f_wb, ax=ax[0])

    ### plot contour ###
    CS = ax[1].contour(tmp_w, tmp_b, np.log(z),levels=12, linewidths=2, alpha=0.7,colors=dlcolors)
    ax[1].set_title('Cost(w,b)')
    ax[1].set_xlabel('w', fontsize=10)
    ax[1].set_ylabel('b', fontsize=10)
    ax[1].set_xlim(w_range) ; ax[1].set_ylim(b_range)
    cscat  = ax[1].scatter(w0,b, s=100, color=dlblue, zorder= 10, label="cost with \ncurrent w,b")
    chline = ax[1].hlines(b, ax[1].get_xlim()[0],w0, lw=4, color=dlpurple, ls='dotted')
    cvline = ax[1].vlines(w0, ax[1].get_ylim()[0],b, lw=4, color=dlpurple, ls='dotted')
    ax[1].text(0.5,0.95,"Click to choose w,b",  bbox=dict(facecolor='white', ec = 'black'), fontsize = 10,
                transform=ax[1].transAxes, verticalalignment = 'center', horizontalalignment= 'center')

    #Surface plot of the cost function J(w,b)
    ax[2].plot_surface(tmp_w, tmp_b, z,  cmap = dlcm, alpha=0.3, antialiased=True)
    ax[2].plot_wireframe(tmp_w, tmp_b, z, color='k', alpha=0.1)
    plt.xlabel("$w$")
    plt.ylabel("$b$")
    ax[2].zaxis.set_rotate_label(False)
    ax[2].xaxis.set_pane_color((1.0, 1.0, 1.0, 0.0))
    ax[2].yaxis.set_pane_color((1.0, 1.0, 1.0, 0.0))
    ax[2].zaxis.set_pane_color((1.0, 1.0, 1.0, 0.0))
    ax[2].set_zlabel("J(w, b)\n\n", rotation=90)
    plt.title("Cost(w,b) \n [You can rotate this figure]", size=12)
    ax[2].view_init(30, -120)

    return fig,ax, [cscat, chline, cvline]


#https://matplotlib.org/stable/users/event_handling.html
class plt_update_onclick:
    def __init__(self, fig, ax, x_train,y_train, dyn_items):
        self.fig = fig
        self.ax = ax
        self.x_train = x_train
        self.y_train = y_train
        self.dyn_items = dyn_items
        self.cid = fig.canvas.mpl_connect('button_press_event', self)

    def __call__(self, event):
        if event.inaxes == self.ax[1]:
            ws = event.xdata
            bs = event.ydata
            cst = compute_cost(self.x_train, self.y_train, ws, bs)

            # clear and redraw line plot
            self.ax[0].clear()
            f_wb = np.dot(self.x_train,ws) + bs
            mk_cost_lines(self.x_train,self.y_train,ws,bs,self.ax[0])
            plt_house_x(self.x_train, self.y_train, f_wb=f_wb, ax=self.ax[0])

            # remove lines and re-add on countour plot and 3d plot
            for artist in self.dyn_items:
                artist.remove()

            a = self.ax[1].scatter(ws,bs, s=100, color=dlblue, zorder= 10, label="cost with \ncurrent w,b")
            b = self.ax[1].hlines(bs, self.ax[1].get_xlim()[0],ws, lw=4, color=dlpurple, ls='dotted')
            c = self.ax[1].vlines(ws, self.ax[1].get_ylim()[0],bs, lw=4, color=dlpurple, ls='dotted')
            d = self.ax[1].annotate(f"Cost: {cst:.0f}", xy= (ws, bs), xytext = (4,4), textcoords = 'offset points',
                               bbox=dict(facecolor='white'), size = 10)

            #Add point in 3D surface plot
            e = self.ax[2].scatter3D(ws, bs,cst , marker='X', s=100)

            self.dyn_items = [a,b,c,d,e]
            self.fig.canvas.draw()


def soup_bowl():
    """ Create figure and plot with a 3D projection"""
    fig = plt.figure(figsize=(8,8))

    #Plot configuration
    ax = fig.add_subplot(111, projection='3d')
    ax.xaxis.set_pane_color((1.0, 1.0, 1.0, 0.0))
    ax.yaxis.set_pane_color((1.0, 1.0, 1.0, 0.0))
    ax.zaxis.set_pane_color((1.0, 1.0, 1.0, 0.0))
    ax.zaxis.set_rotate_label(False)
    ax.view_init(45, -120)

    #Useful linearspaces to give values to the parameters w and b
    w = np.linspace(-20, 20, 100)
    b = np.linspace(-20, 20, 100)

    #Get the z value for a bowl-shaped cost function
    z=np.zeros((len(w), len(b)))
    j=0
    for x in w:
        i=0
        for y in b:
            z[i,j] = x**2 + y**2
            i+=1
        j+=1

    #Meshgrid used for plotting 3D functions
    W, B = np.meshgrid(w, b)

    #Create the 3D surface plot of the bowl-shaped cost function
    ax.plot_surface(W, B, z, cmap = "Spectral_r", alpha=0.7, antialiased=False)
    ax.plot_wireframe(W, B, z, color='k', alpha=0.1)
    ax.set_xlabel("$w$")
    ax.set_ylabel("$b$")
    ax.set_zlabel("$J(w,b)$", rotation=90)
    ax.set_title("$J(w,b)$\n [You can rotate this figure]", size=15)

    plt.show()

def inbounds(a,b,xlim,ylim):
    xlow,xhigh = xlim
    ylow,yhigh = ylim
    ax, ay = a
    bx, by = b
    if (ax > xlow and ax < xhigh) and (bx > xlow and bx < xhigh) \
        and (ay > ylow and ay < yhigh) and (by > ylow and by < yhigh):
        return True
    return False

def plt_contour_wgrad(x, y, hist, ax, w_range=[-100, 500, 5], b_range=[-500, 500, 5],
                contours = [0.1,50,1000,5000,10000,25000,50000],
                      resolution=5, w_final=200, b_final=100,step=10 ):
    b0,w0 = np.meshgrid(np.arange(*b_range),np.arange(*w_range))
    z=np.zeros_like(b0)
    for i in range(w0.shape[0]):
        for j in range(w0.shape[1]):
            z[i][j] = compute_cost(x, y, w0[i][j], b0[i][j] )

    CS = ax.contour(w0, b0, z, contours, linewidths=2,
                   colors=[dlblue, dlorange, dldarkred, dlmagenta, dlpurple])
    ax.clabel(CS, inline=1, fmt='%1.0f', fontsize=10)
    ax.set_xlabel("w");  ax.set_ylabel("b")
    ax.set_title('Contour plot of cost J(w,b), vs b,w with path of gradient descent')
    w = w_final; b=b_final
    ax.hlines(b, ax.get_xlim()[0],w, lw=2, color=dlpurple, ls='dotted')
    ax.vlines(w, ax.get_ylim()[0],b, lw=2, color=dlpurple, ls='dotted')

    base = hist[0]
    for point in hist[0::step]:
        edist = np.sqrt((base[0] - point[0])**2 + (base[1] - point[1])**2)
        if(edist > resolution or point==hist[-1]):
            if inbounds(point,base, ax.get_xlim(),ax.get_ylim()):
                plt.annotate('', xy=point, xytext=base,xycoords='data',
                         arrowprops={'arrowstyle': '->', 'color': 'r', 'lw': 3},
                         va='center', ha='center')
            base=point
    return


def plt_divergence(p_hist, J_hist, x_train,y_train):

    x=np.zeros(len(p_hist))
    y=np.zeros(len(p_hist))
    v=np.zeros(len(p_hist))
    for i in range(len(p_hist)):
        x[i] = p_hist[i][0]
        y[i] = p_hist[i][1]
        v[i] = J_hist[i]

    fig = plt.figure(figsize=(12,5))
    plt.subplots_adjust( wspace=0 )
    gs = fig.add_gridspec(1, 5)
    fig.suptitle(f"Cost escalates when learning rate is too large")
    #===============
    #  First subplot
    #===============
    ax = fig.add_subplot(gs[:2], )

    # Print w vs cost to see minimum
    fix_b = 100
    w_array = np.arange(-70000, 70000, 1000, dtype="int64")
    cost = np.zeros_like(w_array,float)

    for i in range(len(w_array)):
        tmp_w = w_array[i]
        cost[i] = compute_cost(x_train, y_train, tmp_w, fix_b)

    ax.plot(w_array, cost)
    ax.plot(x,v, c=dlmagenta)
    ax.set_title("Cost vs w, b set to 100")
    ax.set_ylabel('Cost')
    ax.set_xlabel('w')
    ax.xaxis.set_major_locator(MaxNLocator(2))

    #===============
    # Second Subplot
    #===============

    tmp_b,tmp_w = np.meshgrid(np.arange(-35000, 35000, 500),np.arange(-70000, 70000, 500))
    tmp_b = tmp_b.astype('int64')
    tmp_w = tmp_w.astype('int64')
    z=np.zeros_like(tmp_b,float)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i][j] = compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j] )

    ax = fig.add_subplot(gs[2:], projection='3d')
    ax.plot_surface(tmp_w, tmp_b, z,  alpha=0.3, color=dlblue)
    ax.xaxis.set_major_locator(MaxNLocator(2))
    ax.yaxis.set_major_locator(MaxNLocator(2))

    ax.set_xlabel('w', fontsize=16)
    ax.set_ylabel('b', fontsize=16)
    ax.set_zlabel('\ncost', fontsize=16)
    plt.title('Cost vs (b, w)')
    # Customize the view angle
    ax.view_init(elev=20., azim=-65)
    ax.plot(x, y, v,c=dlmagenta)

    return

# draw derivative line
# y = m*(x - x1) + y1
def add_line(dj_dx, x1, y1, d, ax):
    x = np.linspace(x1-d, x1+d,50)
    y = dj_dx*(x - x1) + y1
    ax.scatter(x1, y1, color=dlblue, s=50)
    ax.plot(x, y, '--', c=dldarkred,zorder=10, linewidth = 1)
    xoff = 30 if x1 == 200 else 10
    ax.annotate(r"$\frac{\partial J}{\partial w}$ =%d" % dj_dx, fontsize=14,
                xy=(x1, y1), xycoords='data',
            xytext=(xoff, 10), textcoords='offset points',
            arrowprops=dict(arrowstyle="->"),
            horizontalalignment='left', verticalalignment='top')

def plt_gradients(x_train,y_train, f_compute_cost, f_compute_gradient):
    #===============
    #  First subplot
    #===============
    fig,ax = plt.subplots(1,2,figsize=(12,4))

    # Print w vs cost to see minimum
    fix_b = 100
    w_array = np.linspace(-100, 500, 50)
    w_array = np.linspace(0, 400, 50)
    cost = np.zeros_like(w_array)

    for i in range(len(w_array)):
        tmp_w = w_array[i]
        cost[i] = f_compute_cost(x_train, y_train, tmp_w, fix_b)
    ax[0].plot(w_array, cost,linewidth=1)
    ax[0].set_title("Cost vs w, with gradient; b set to 100")
    ax[0].set_ylabel('Cost')
    ax[0].set_xlabel('w')

    # plot lines for fixed b=100
    for tmp_w in [100,200,300]:
        fix_b = 100
        dj_dw,dj_db = f_compute_gradient(x_train, y_train, tmp_w, fix_b )
        j = f_compute_cost(x_train, y_train, tmp_w, fix_b)
        add_line(dj_dw, tmp_w, j, 30, ax[0])

    #===============
    # Second Subplot
    #===============

    tmp_b,tmp_w = np.meshgrid(np.linspace(-200, 200, 10), np.linspace(-100, 600, 10))
    U = np.zeros_like(tmp_w)
    V = np.zeros_like(tmp_b)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            U[i][j], V[i][j] = f_compute_gradient(x_train, y_train, tmp_w[i][j], tmp_b[i][j] )
    X = tmp_w
    Y = tmp_b
    n=-2
    color_array = np.sqrt(((V-n)/2)**2 + ((U-n)/2)**2)

    ax[1].set_title('Gradient shown in quiver plot')
    Q = ax[1].quiver(X, Y, U, V, color_array, units='width', )
    ax[1].quiverkey(Q, 0.9, 0.9, 2, r'$2 \frac{m}{s}$', labelpos='E',coordinates='figure')
    ax[1].set_xlabel("w"); ax[1].set_ylabel("b")


##########################################################
# Plotly-based Interactive Plotting Routines
##########################################################

def plotly_stationary(x_train, y_train):
    """
    Interactive 3D visualization of cost function J(w,b) using Plotly.
    Shows contour plot and 3D surface with interactive controls.
    
    Parameters:
    -----------
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets
        
    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure
    """
    # Setup useful ranges
    w_range = np.array([200-300., 200+300])
    b_range = np.array([50-300., 50+300])
    b_space = np.linspace(*b_range, 100)
    w_space = np.linspace(*w_range, 100)

    # Get cost for w,b ranges for contour and 3D
    tmp_b, tmp_w = np.meshgrid(b_space, w_space)
    z = np.zeros_like(tmp_b)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i,j] = compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j])
            if z[i,j] == 0: 
                z[i,j] = 1e-6

    w0 = 200
    b0 = -100  # initial point
    
    # Create subplots: 1 row, 2 columns (contour and 3D surface)
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=('Cost(w,b) - Contour Plot', 'Cost(w,b) - 3D Surface'),
        specs=[[{'type': 'contour'}, {'type': 'surface'}]],
        horizontal_spacing=0.12
    )
    
    # Add contour plot
    contour = go.Contour(
        x=w_space,
        y=b_space,
        z=np.log(z.T),  # Transpose for correct orientation
        colorscale='Viridis',
        contours=dict(
            start=np.log(z).min(),
            end=np.log(z).max(),
            size=(np.log(z).max() - np.log(z).min()) / 12
        ),
        name='Cost',
        showscale=True,
        colorbar=dict(x=0.46, len=0.75)
    )
    
    # Add initial point marker on contour
    marker_contour = go.Scatter(
        x=[w0],
        y=[b0],
        mode='markers',
        marker=dict(size=12, color='red', symbol='x'),
        name='Initial (w,b)',
        showlegend=True
    )
    
    fig.add_trace(contour, row=1, col=1)
    fig.add_trace(marker_contour, row=1, col=1)
    
    # Add 3D surface plot
    surface = go.Surface(
        x=tmp_w,
        y=tmp_b,
        z=z,
        colorscale='Viridis',
        opacity=0.9,
        name='Cost Surface',
        showscale=False
    )
    
    # Add initial point marker on 3D surface
    cost_at_initial = compute_cost(x_train, y_train, w0, b0)
    marker_3d = go.Scatter3d(
        x=[w0],
        y=[b0],
        z=[cost_at_initial],
        mode='markers',
        marker=dict(size=8, color='red', symbol='diamond'),
        name='Initial (w,b)',
        showlegend=False
    )
    
    fig.add_trace(surface, row=1, col=2)
    fig.add_trace(marker_3d, row=1, col=2)
    
    # Update layout
    fig.update_xaxes(title_text="w", row=1, col=1, range=w_range)
    fig.update_yaxes(title_text="b", row=1, col=1, range=b_range)
    
    fig.update_layout(
        title_text="Interactive Cost Function Visualization",
        showlegend=True,
        height=600,
        scene=dict(
            xaxis_title="w",
            yaxis_title="b",
            zaxis_title="J(w,b)",
            camera=dict(
                eye=dict(x=1.5, y=-1.5, z=1.2)
            )
        )
    )
    
    return fig


def plotly_soup_bowl():
    """
    Create interactive 3D bowl-shaped cost function visualization using Plotly.
    Demonstrates the concept of gradient descent optimization landscape.
    
    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure with 3D bowl surface
    """
    # Create linearspaces for parameters w and b
    w = np.linspace(-20, 20, 100)
    b = np.linspace(-20, 20, 100)

    # Get the z value for a bowl-shaped cost function
    z = np.zeros((len(w), len(b)))
    for i, x in enumerate(w):
        for j, y in enumerate(b):
            z[i, j] = x**2 + y**2

    # Meshgrid for plotting 3D functions
    W, B = np.meshgrid(w, b)

    # Create the 3D surface plot
    fig = go.Figure()
    
    # Add surface
    surface = go.Surface(
        x=W,
        y=B,
        z=z.T,  # Transpose for correct orientation
        colorscale='Spectral_r',
        opacity=0.9,
        name='J(w,b)',
        showscale=True,
        colorbar=dict(title="Cost", x=1.0)
    )
    
    fig.add_trace(surface)
    
    # Add wireframe for better visualization
    # Create wireframe by adding lines at regular intervals
    step = 10
    for i in range(0, len(w), step):
        fig.add_trace(go.Scatter3d(
            x=W[i, :],
            y=B[i, :],
            z=z.T[i, :],
            mode='lines',
            line=dict(color='black', width=1),
            showlegend=False,
            opacity=0.3,
            hoverinfo='skip'
        ))
    
    for j in range(0, len(b), step):
        fig.add_trace(go.Scatter3d(
            x=W[:, j],
            y=B[:, j],
            z=z.T[:, j],
            mode='lines',
            line=dict(color='black', width=1),
            showlegend=False,
            opacity=0.3,
            hoverinfo='skip'
        ))
    
    # Update layout
    fig.update_layout(
        title="Bowl-Shaped Cost Function J(w,b)<br><sub>Rotate and zoom to explore the 3D surface</sub>",
        scene=dict(
            xaxis_title="w",
            yaxis_title="b",
            zaxis_title="J(w,b)",
            camera=dict(
                eye=dict(x=1.5, y=-1.5, z=1.2)
            ),
            xaxis=dict(backgroundcolor="white", gridcolor="lightgray"),
            yaxis=dict(backgroundcolor="white", gridcolor="lightgray"),
            zaxis=dict(backgroundcolor="white", gridcolor="lightgray")
        ),
        height=700,
        showlegend=False
    )
    
    return fig


def plotly_plt_intuition(x_train, y_train):
    """
    Interactive visualization showing how cost changes with parameter w using Plotly.
    Similar to plt_intuition but with Plotly's interactive slider.
    
    Parameters:
    -----------
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets
        
    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure with slider control
    """
    w_range = np.array([200-200, 200+200])
    tmp_b = 100

    w_array = np.arange(*w_range, 5)
    cost = np.zeros_like(w_array)
    for i in range(len(w_array)):
        tmp_w = w_array[i]
        cost[i] = compute_cost(x_train, y_train, tmp_w, tmp_b)

    # Create frames for animation/slider
    w_values = np.arange(*w_range, 10)
    frames = []
    
    for w_val in w_values:
        f_wb = np.dot(x_train, w_val) + tmp_b
        cur_cost = compute_cost(x_train, y_train, w_val, tmp_b)
        
        # Calculate individual costs for annotations
        cost_lines_x = []
        cost_lines_y = []
        annotations = []
        
        for i, (x_i, y_i) in enumerate(zip(x_train, y_train)):
            f_wb_i = w_val * x_i + tmp_b
            cost_lines_x.extend([x_i, x_i, None])
            cost_lines_y.extend([y_i, f_wb_i, None])
            
            # Add cost annotation
            c_i = ((f_wb_i - y_i)**2) / 2
            mid_y = y_i + (f_wb_i - y_i) / 2
            annotations.append(
                dict(
                    x=x_i,
                    y=mid_y,
                    text=f'{c_i:0.0f}',
                    showarrow=False,
                    xshift=10,
                    font=dict(color='purple', size=10),
                    xref='x1',
                    yref='y1'
                )
            )
        
        frames.append(go.Frame(
            data=[
                go.Scatter(x=x_train, y=y_train, mode='markers', 
                          marker=dict(symbol='x', size=10, color='red'),
                          name='Actual Value'),
                go.Scatter(x=x_train, y=f_wb, mode='lines',
                          line=dict(color='blue', width=2),
                          name='Our Prediction'),
                go.Scatter(x=cost_lines_x, y=cost_lines_y, mode='lines',
                          line=dict(color='purple', width=2, dash='dot'),
                          name='Cost Lines',
                          showlegend=False),
                go.Scatter(x=w_array, y=cost, mode='lines',
                          line=dict(color='blue', width=2),
                          name='Cost vs w',
                          showlegend=False),
                go.Scatter(x=[w_val], y=[cur_cost], mode='markers',
                          marker=dict(size=12, color='darkred'),
                          name=f'cost at w={w_val}',
                          showlegend=False),
                go.Scatter(x=[w_val, w_val], y=[0, cur_cost], mode='lines',
                          line=dict(color='purple', width=3, dash='dot'),
                          showlegend=False),
                go.Scatter(x=[w_array[0], w_val], y=[cur_cost, cur_cost], mode='lines',
                          line=dict(color='purple', width=3, dash='dot'),
                          showlegend=False)
            ],
            layout=go.Layout(
                annotations=annotations + [
                    dict(
                        x=0.5, y=1.15,
                        text=f"Minimize Cost: Current Cost = {cur_cost:0.0f}",
                        showarrow=False,
                        xref='paper', yref='paper',
                        font=dict(size=14, color='black'),
                        xanchor='center'
                    )
                ]
            ),
            name=str(w_val)
        ))
    
    # Create initial frame (w=150)
    w_init = 150
    f_wb_init = np.dot(x_train, w_init) + tmp_b
    cur_cost_init = compute_cost(x_train, y_train, w_init, tmp_b)
    
    cost_lines_x_init = []
    cost_lines_y_init = []
    annotations_init = []
    
    for x_i, y_i in zip(x_train, y_train):
        f_wb_i = w_init * x_i + tmp_b
        cost_lines_x_init.extend([x_i, x_i, None])
        cost_lines_y_init.extend([y_i, f_wb_i, None])
        
        c_i = ((f_wb_i - y_i)**2) / 2
        mid_y = y_i + (f_wb_i - y_i) / 2
        annotations_init.append(
            dict(
                x=x_i,
                y=mid_y,
                text=f'{c_i:0.0f}',
                showarrow=False,
                xshift=10,
                font=dict(color='purple', size=10)
            )
        )
    
    # Create figure with subplots
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=('Housing Prices', 'Cost vs. w (b fixed at 100)'),
        horizontal_spacing=0.15
    )
    
    # Left plot: Housing data with prediction
    fig.add_trace(
        go.Scatter(x=x_train, y=y_train, mode='markers',
                  marker=dict(symbol='x', size=10, color='red'),
                  name='Actual Value'),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(x=x_train, y=f_wb_init, mode='lines',
                  line=dict(color='blue', width=2),
                  name='Our Prediction'),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(x=cost_lines_x_init, y=cost_lines_y_init, mode='lines',
                  line=dict(color='purple', width=2, dash='dot'),
                  name='Cost Lines',
                  showlegend=False),
        row=1, col=1
    )
    
    # Right plot: Cost function
    fig.add_trace(
        go.Scatter(x=w_array, y=cost, mode='lines',
                  line=dict(color='blue', width=2),
                  name='Cost vs w'),
        row=1, col=2
    )
    
    fig.add_trace(
        go.Scatter(x=[w_init], y=[cur_cost_init], mode='markers',
                  marker=dict(size=12, color='darkred'),
                  name=f'cost at w={w_init}'),
        row=1, col=2
    )
    
    fig.add_trace(
        go.Scatter(x=[w_init, w_init], y=[0, cur_cost_init], mode='lines',
                  line=dict(color='purple', width=3, dash='dot'),
                  showlegend=False),
        row=1, col=2
    )
    
    fig.add_trace(
        go.Scatter(x=[w_array[0], w_init], y=[cur_cost_init, cur_cost_init], mode='lines',
                  line=dict(color='purple', width=3, dash='dot'),
                  showlegend=False),
        row=1, col=2
    )
    
    # Update layout
    fig.update_xaxes(title_text="Size (100 m²)", row=1, col=1)
    fig.update_yaxes(title_text="Price (in 1000s of CHF)", row=1, col=1)
    fig.update_xaxes(title_text="w", row=1, col=2)
    fig.update_yaxes(title_text="Cost", row=1, col=2)
    
    # Add slider
    sliders = [dict(
        active=len(w_values)//2,
        yanchor="top",
        y=-0.1,
        xanchor="left",
        currentvalue=dict(
            prefix="w = ",
            visible=True,
            xanchor="center"
        ),
        pad=dict(b=10, t=50),
        len=0.9,
        x=0.05,
        steps=[dict(
            args=[[f.name], dict(
                frame=dict(duration=0, redraw=True),
                mode="immediate"
            )],
            label=str(w_val),
            method="animate"
        ) for f, w_val in zip(frames, w_values)]
    )]
    
    fig.update_layout(
        sliders=sliders,
        height=500,
        title_text=f"Minimize Cost: Current Cost = {cur_cost_init:0.0f}",
        showlegend=True,
        annotations=annotations_init
    )
    
    fig.frames = frames
    
    return fig


def plotly_stationary_interactive(x_train, y_train):
    """
    Enhanced interactive version of plt_stationary compatible with the original interface.
    Creates a plotly figure with contour and 3D plots that can be updated on click.
    
    Parameters:
    -----------
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets
        
    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure
    None : placeholder for ax (compatibility)
    None : placeholder for dyn_items (compatibility)
        
    Usage:
    ------
    # Simple usage
    fig = plotly_stationary_interactive(x_train, y_train)
    fig.show()
    
    # Or for compatibility with original interface
    fig, _, _ = plotly_stationary_interactive(x_train, y_train)
    fig.show()
    """
    # Setup useful ranges
    w_range = np.array([200-300., 200+300])
    b_range = np.array([50-300., 50+300])
    b_space = np.linspace(*b_range, 100)
    w_space = np.linspace(*w_range, 100)

    # Get cost for w,b ranges for contour and 3D
    tmp_b, tmp_w = np.meshgrid(b_space, w_space)
    z = np.zeros_like(tmp_b)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i,j] = compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j])
            if z[i,j] == 0: 
                z[i,j] = 1e-6

    w0 = 200
    b0 = -100  # initial point
    f_wb = np.dot(x_train, w0) + b0
    
    # Create subplots: 1 row, 3 columns (house plot, contour, 3D surface)
    fig = make_subplots(
        rows=1, cols=3,
        subplot_titles=('Housing Prices', 'Cost(w,b) - Contour', 'Cost(w,b) - 3D Surface'),
        specs=[[{'type': 'scatter'}, {'type': 'contour'}, {'type': 'surface'}]],
        horizontal_spacing=0.08,
        column_widths=[0.28, 0.36, 0.36]
    )
    
    # Left plot: Housing data with prediction
    fig.add_trace(
        go.Scatter(x=x_train, y=y_train, mode='markers',
                  marker=dict(symbol='x', size=10, color='red'),
                  name='Actual Value'),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(x=x_train, y=f_wb, mode='lines',
                  line=dict(color='blue', width=2),
                  name='Our Prediction'),
        row=1, col=1
    )
    
    # Add cost lines
    cost_lines_x = []
    cost_lines_y = []
    for x_i, y_i in zip(x_train, y_train):
        f_wb_i = w0 * x_i + b0
        cost_lines_x.extend([x_i, x_i, None])
        cost_lines_y.extend([y_i, f_wb_i, None])
    
    fig.add_trace(
        go.Scatter(x=cost_lines_x, y=cost_lines_y, mode='lines',
                  line=dict(color='purple', width=2, dash='dot'),
                  name='Cost',
                  showlegend=False),
        row=1, col=1
    )
    
    # Middle: Contour plot
    contour = go.Contour(
        x=w_space,
        y=b_space,
        z=np.log(z.T),
        colorscale='Viridis',
        contours=dict(
            start=np.log(z).min(),
            end=np.log(z).max(),
            size=(np.log(z).max() - np.log(z).min()) / 12
        ),
        name='Cost',
        showscale=False,
        hovertemplate='w: %{x:.1f}<br>b: %{y:.1f}<extra></extra>'
    )
    
    # Add crosshairs on contour (before marker so they're behind)
    fig.add_trace(
        go.Scatter(x=[w_range[0], w0], y=[b0, b0], mode='lines',
                  line=dict(color='purple', width=2, dash='dot'),
                  showlegend=False, hoverinfo='skip'),
        row=1, col=2
    )
    
    fig.add_trace(
        go.Scatter(x=[w0, w0], y=[b_range[0], b0], mode='lines',
                  line=dict(color='purple', width=2, dash='dot'),
                  showlegend=False, hoverinfo='skip'),
        row=1, col=2
    )
    
    fig.add_trace(contour, row=1, col=2)
    
    # Add initial point marker on contour
    marker_contour = go.Scatter(
        x=[w0],
        y=[b0],
        mode='markers+text',
        marker=dict(size=12, color='blue'),
        name='Current w,b',
        text=[f'Cost: {compute_cost(x_train, y_train, w0, b0):.0f}'],
        textposition='top center',
        textfont=dict(size=10),
        showlegend=False,
        hovertemplate='w: %{x:.1f}<br>b: %{y:.1f}<extra></extra>'
    )
    
    fig.add_trace(marker_contour, row=1, col=2)
    
    # Right: 3D surface plot
    surface = go.Surface(
        x=tmp_w,
        y=tmp_b,
        z=z,
        colorscale='Viridis',
        opacity=0.9,
        name='Cost Surface',
        showscale=True,
        colorbar=dict(x=1.02, len=0.75)
    )
    
    # Add initial point marker on 3D surface
    cost_at_initial = compute_cost(x_train, y_train, w0, b0)
    marker_3d = go.Scatter3d(
        x=[w0],
        y=[b0],
        z=[cost_at_initial],
        mode='markers',
        marker=dict(size=6, color='red', symbol='diamond'),
        name='Current Point',
        showlegend=False
    )
    
    fig.add_trace(surface, row=1, col=3)
    fig.add_trace(marker_3d, row=1, col=3)
    
    # Update axes
    fig.update_xaxes(title_text="Size (100 m²)", row=1, col=1)
    fig.update_yaxes(title_text="Price (1000s CHF)", row=1, col=1)
    fig.update_xaxes(title_text="w", row=1, col=2, range=w_range)
    fig.update_yaxes(title_text="b", row=1, col=2, range=b_range)
    
    # Update layout
    fig.update_layout(
        title_text="Interactive Cost Function Visualization (Rotate, Zoom, Hover)",
        showlegend=True,
        height=500,
        scene=dict(
            xaxis_title="w",
            yaxis_title="b",
            zaxis_title="J(w,b)",
            camera=dict(
                eye=dict(x=1.5, y=-1.5, z=1.2)
            )
        )
    )
    
    # Return fig and None placeholders for compatibility with original interface
    return fig, None, None



def plotly_plt_gradients(x_train, y_train, f_compute_cost, f_compute_gradient):
    """
    Plotly version of plt_gradients showing gradient descent concepts.
    Creates an interactive plot showing cost vs w with gradient lines (tangent lines) at specific points.

    Parameters:
    -----------
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets
    f_compute_cost : function
        Cost function that takes (x, y, w, b) and returns cost
    f_compute_gradient : function
        Gradient function that takes (x, y, w, b) and returns (dj_dw, dj_db)

    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure

    Usage:
    ------
    fig = plotly_plt_gradients(x_train, y_train, compute_cost, compute_gradient)
    fig.show()
    """
    # Create single plot
    fig = go.Figure()

    # Compute cost for range of w values (b fixed at 100)
    fix_b = 100
    w_array = np.linspace(0, 400, 50)
    cost = np.zeros_like(w_array)

    for i in range(len(w_array)):
        tmp_w = w_array[i]
        cost[i] = f_compute_cost(x_train, y_train, tmp_w, fix_b)

    # Plot cost curve
    fig.add_trace(
        go.Scatter(
            x=w_array,
            y=cost,
            mode='lines',
            line=dict(color='blue', width=2),
            name='Cost J(w,b)',
            showlegend=True
        )
    )

    # Add gradient lines (tangent lines) at w = 100, 200, 300
    gradient_w_values = [100, 200, 300]
    colors = ['red', 'green', 'orange']

    for tmp_w, color in zip(gradient_w_values, colors):
        # Compute gradient at this point
        dj_dw, dj_db = f_compute_gradient(x_train, y_train, tmp_w, fix_b)
        j = f_compute_cost(x_train, y_train, tmp_w, fix_b)

        # Create tangent line: y = m*(x - x1) + y1
        d = 30  # range for the line
        x_line = np.linspace(tmp_w - d, tmp_w + d, 50)
        y_line = dj_dw * (x_line - tmp_w) + j

        # Add tangent line
        fig.add_trace(
            go.Scatter(
                x=x_line,
                y=y_line,
                mode='lines',
                line=dict(color=color, width=2, dash='dash'),
                name=f'∂J/∂w at w={tmp_w}',
                showlegend=True
            )
        )

        # Add point marker
        fig.add_trace(
            go.Scatter(
                x=[tmp_w],
                y=[j],
                mode='markers',
                marker=dict(size=10, color=color),
                showlegend=False,
                hovertemplate=f'w={tmp_w}<br>Cost={j:.1f}<br>∂J/∂w={dj_dw:.0f}<extra></extra>'
            )
        )

        # Add annotation for gradient value
        xoff = 30 if tmp_w == 200 else 10
        fig.add_annotation(
            x=tmp_w,
            y=j,
            text=f'∂J/∂w={dj_dw:.0f}',
            showarrow=True,
            arrowhead=2,
            arrowsize=1,
            arrowwidth=2,
            arrowcolor=color,
            ax=xoff,
            ay=-20,
            font=dict(size=11, color=color)
        )

    # Update axes and layout
    fig.update_xaxes(title_text="w", title_font=dict(size=18), tickfont=dict(size=14))
    fig.update_yaxes(title_text="Cost", title_font=dict(size=18), tickfont=dict(size=14))

    fig.update_layout(
        title_text="Cost vs w, with gradient (b fixed at 100)",
        title_font=dict(size=20),
        showlegend=True,
        width=900,   # Set width
        height=700,  # Increased from 500
        hovermode='closest',
        legend=dict(
            font=dict(size=14),  # Larger legend text
            x=1.02,
            y=1,
            xanchor='left',
            yanchor='top'
        )
    )

    return fig


def plotly_plt_gradients_surface(x_train, y_train, f_compute_cost, f_compute_gradient):
    """
    Plotly version showing gradient descent on cost surface with both w and b varying.
    Creates two interactive plots:
    1. Contour plot with gradient vectors
    2. 3D surface plot with gradient vectors

    Parameters:
    -----------
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets
    f_compute_cost : function
        Cost function that takes (x, y, w, b) and returns cost
    f_compute_gradient : function
        Gradient function that takes (x, y, w, b) and returns (dj_dw, dj_db)

    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure with two subplots

    Usage:
    ------
    fig = plotly_plt_gradients_surface(x_train, y_train, compute_cost, compute_gradient)
    fig.show()
    """
    # Setup ranges
    w_range = np.array([200-300., 200+300])
    b_range = np.array([50-300., 50+300])
    b_space = np.linspace(*b_range, 100)
    w_space = np.linspace(*w_range, 100)

    # Get cost for w,b ranges for contour and 3D
    tmp_b, tmp_w = np.meshgrid(b_space, w_space)
    z = np.zeros_like(tmp_b)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i,j] = f_compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j])
            if z[i,j] == 0:
                z[i,j] = 1e-6

    # Create gradient vector field
    tmp_b_grad, tmp_w_grad = np.meshgrid(np.linspace(-200, 200, 12), np.linspace(-100, 600, 12))
    U = np.zeros_like(tmp_w_grad)  # dj_dw components
    V = np.zeros_like(tmp_b_grad)  # dj_db components

    for i in range(tmp_w_grad.shape[0]):
        for j in range(tmp_w_grad.shape[1]):
            U[i][j], V[i][j] = f_compute_gradient(x_train, y_train, tmp_w_grad[i][j], tmp_b_grad[i][j])

    # Flatten arrays for plotting
    X = tmp_w_grad.flatten()
    Y = tmp_b_grad.flatten()
    U_flat = U.flatten()
    V_flat = V.flatten()

    # Compute color based on magnitude
    color_array = np.sqrt(U_flat**2 + V_flat**2)
    color_array_norm = (color_array - color_array.min()) / (color_array.max() - color_array.min() + 1e-10)

    # Create subplots
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=('Contour Plot with Gradients', '3D Surface with Gradients'),
        specs=[[{'type': 'contour'}, {'type': 'surface'}]],
        horizontal_spacing=0.08
    )

    # Left: Contour plot
    contour = go.Contour(
        x=w_space,
        y=b_space,
        z=np.log(z.T),
        colorscale='Viridis',
        contours=dict(
            start=np.log(z).min(),
            end=np.log(z).max(),
            size=(np.log(z).max() - np.log(z).min()) / 15
        ),
        name='Cost',
        showscale=True,
        colorbar=dict(x=0.45, len=0.75, title="Log(Cost)")
    )

    fig.add_trace(contour, row=1, col=1)

    # Add gradient arrows to contour plot
    scale = 30
    for i in range(len(X)):
        mag = np.sqrt(U_flat[i]**2 + V_flat[i]**2)
        if mag > 0:
            # Negative gradient (direction of descent)
            u_norm = -U_flat[i] / mag * scale
            v_norm = -V_flat[i] / mag * scale
        else:
            u_norm = 0
            v_norm = 0

        # Color based on magnitude
        cmap_val = color_array_norm[i]
        r = int(255 * cmap_val)
        g = int(150 * (1 - cmap_val))
        b = int(255 * (1 - cmap_val))

        fig.add_annotation(
            x=X[i] + u_norm,
            y=Y[i] + v_norm,
            ax=X[i],
            ay=Y[i],
            xref='x1',
            yref='y1',
            axref='x1',
            ayref='y1',
            showarrow=True,
            arrowhead=2,
            arrowsize=1.5,
            arrowwidth=2.5,
            arrowcolor=f'rgba({r}, {g}, {b}, 0.7)'
        )

    # Right: 3D Surface plot
    surface = go.Surface(
        x=tmp_w,
        y=tmp_b,
        z=z,
        colorscale='Viridis',
        opacity=0.9,
        name='Cost Surface',
        showscale=True,
        colorbar=dict(x=1.0, len=0.75, title="Cost")
    )

    fig.add_trace(surface, row=1, col=2)

    # Add gradient vectors on 3D surface
    # Sample fewer points for 3D visualization
    sample_indices = range(0, len(X), 2)
    for idx in sample_indices:
        i = idx
        mag = np.sqrt(U_flat[i]**2 + V_flat[i]**2)
        if mag > 0:
            # Negative gradient (direction of descent)
            u_norm = -U_flat[i] / mag * scale
            v_norm = -V_flat[i] / mag * scale

            # Get z-value at this point
            z_val = f_compute_cost(x_train, y_train, X[i], Y[i])
            z_end = f_compute_cost(x_train, y_train, X[i] + u_norm, Y[i] + v_norm)

            # Add arrow as a line
            fig.add_trace(
                go.Scatter3d(
                    x=[X[i], X[i] + u_norm],
                    y=[Y[i], Y[i] + v_norm],
                    z=[z_val, z_end],
                    mode='lines',
                    line=dict(color='red', width=4),
                    showlegend=False,
                    hoverinfo='skip'
                ),
                row=1, col=2
            )

    # Update axes
    fig.update_xaxes(title_text="w", title_font=dict(size=16), tickfont=dict(size=12), row=1, col=1)
    fig.update_yaxes(title_text="b", title_font=dict(size=16), tickfont=dict(size=12), row=1, col=1)

    # Update layout
    fig.update_layout(
        title_text="Gradient Descent Visualization: Cost Surface with Gradient Vectors",
        title_font=dict(size=18),
        showlegend=False,
        height=600,
        scene=dict(
            xaxis_title="w",
            yaxis_title="b",
            zaxis_title="Cost J(w,b)",
            xaxis=dict(title_font=dict(size=14)),
            yaxis=dict(title_font=dict(size=14)),
            zaxis=dict(title_font=dict(size=14)),
            camera=dict(
                eye=dict(x=1.5, y=-1.5, z=1.2)
            )
        )
    )

    return fig


def plotly_plt_contour_wgrad(x, y, hist, w_range=[-100, 500, 5], b_range=[-500, 500, 5],
                contours = [0.1,50,1000,5000,10000,25000,50000],
                      resolution=5, w_final=200, b_final=100, step=10):
    """
    Plotly version of plt_contour_wgrad showing contour plot with gradient descent path.

    Parameters:
    -----------
    x : array-like
        Training data features
    y : array-like
        Training data targets
    hist : list
        History of [w,b] parameters during gradient descent
    w_range : list
        [start, stop, step] for w axis
    b_range : list
        [start, stop, step] for b axis
    contours : list
        Contour levels to plot
    resolution : float
        Minimum distance between arrows
    w_final : float
        Final w value (for crosshairs)
    b_final : float
        Final b value (for crosshairs)
    step : int
        Step size for sampling history points

    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure
    """
    # Create meshgrid
    b0, w0 = np.meshgrid(np.arange(*b_range), np.arange(*w_range))
    z = np.zeros_like(b0)
    for i in range(w0.shape[0]):
        for j in range(w0.shape[1]):
            z[i][j] = compute_cost(x, y, w0[i][j], b0[i][j])

    # Create figure
    fig = go.Figure()

    # Add contour plot
    fig.add_trace(go.Contour(
        x=b0[0, :],
        y=w0[:, 0],
        z=z,
        contours=dict(
            start=min(contours),
            end=max(contours),
            size=(max(contours) - min(contours)) / len(contours),
            showlabels=True,
            labelfont=dict(size=12, color='white')
        ),
        colorscale='Viridis',
        showscale=True,
        colorbar=dict(title="Cost")
    ))

    # Add crosshairs
    fig.add_trace(go.Scatter(
        x=[b_range[0], b_final],
        y=[w_final, w_final],
        mode='lines',
        line=dict(color='purple', width=2, dash='dot'),
        showlegend=False,
        hoverinfo='skip'
    ))

    fig.add_trace(go.Scatter(
        x=[b_final, b_final],
        y=[w_range[0], w_final],
        mode='lines',
        line=dict(color='purple', width=2, dash='dot'),
        showlegend=False,
        hoverinfo='skip'
    ))

    # Add gradient descent path with arrows
    base = hist[0]
    for point in hist[0::step]:
        edist = np.sqrt((base[0] - point[0])**2 + (base[1] - point[1])**2)
        if edist > resolution or point == hist[-1]:
            # Check if in bounds
            if (w_range[0] <= point[0] <= w_range[1] and
                b_range[0] <= point[1] <= b_range[1] and
                w_range[0] <= base[0] <= w_range[1] and
                b_range[0] <= base[1] <= b_range[1]):

                # Add arrow
                fig.add_annotation(
                    x=point[1],  # b value
                    y=point[0],  # w value
                    ax=base[1],
                    ay=base[0],
                    xref='x',
                    yref='y',
                    axref='x',
                    ayref='y',
                    showarrow=True,
                    arrowhead=2,
                    arrowsize=1,
                    arrowwidth=3,
                    arrowcolor='red'
                )
            base = point

    # Update layout
    fig.update_layout(
        title="Contour plot of cost J(w,b) with path of gradient descent",
        title_font=dict(size=18),
        xaxis_title="b",
        yaxis_title="w",
        xaxis=dict(title_font=dict(size=16), tickfont=dict(size=12)),
        yaxis=dict(title_font=dict(size=16), tickfont=dict(size=12)),
        width=900,
        height=700,
        hovermode='closest'
    )

    return fig


def plotly_plt_divergence(p_hist, J_hist, x_train, y_train):
    """
    Plotly version of plt_divergence showing cost escalation when learning rate is too large.
    Automatically scales to the actual path taken during gradient descent.

    Parameters:
    -----------
    p_hist : list
        History of [w,b] parameters
    J_hist : list
        History of cost values
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets

    Returns:
    --------
    fig : plotly.graph_objects.Figure
        Interactive plotly figure with two subplots
    """
    # Extract w, b, cost from history
    x = np.array([p[0] for p in p_hist])  # w values
    y = np.array([p[1] for p in p_hist])  # b values
    v = np.array(J_hist)  # cost values

    # Determine adaptive ranges based on the actual path
    w_min, w_max = x.min(), x.max()
    b_min, b_max = y.min(), y.max()

    # Add padding (50% on each side)
    w_range_size = max(abs(w_max - w_min), 100)  # minimum range of 100
    b_range_size = max(abs(b_max - b_min), 100)  # minimum range of 100

    w_padding = w_range_size * 0.5
    b_padding = b_range_size * 0.5

    w_plot_min = w_min - w_padding
    w_plot_max = w_max + w_padding
    b_plot_min = b_min - b_padding
    b_plot_max = b_max + b_padding

    # Determine step size based on range
    w_step = max(int((w_plot_max - w_plot_min) / 50), 1)
    b_step = max(int((b_plot_max - b_plot_min) / 50), 1)

    # Create subplots
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=('Cost vs w (b=100)', 'Cost vs (w, b)'),
        specs=[[{'type': 'scatter'}, {'type': 'surface'}]],
        horizontal_spacing=0.1,
        column_widths=[0.4, 0.6]
    )

    # Left subplot: Cost vs w (b fixed at 100)
    fix_b = 100
    w_array_step = max(int(w_range_size / 100), 1)
    w_array = np.arange(int(w_plot_min), int(w_plot_max), w_array_step)
    cost = np.zeros_like(w_array, float)

    for i in range(len(w_array)):
        tmp_w = w_array[i]
        cost[i] = compute_cost(x_train, y_train, tmp_w, fix_b)

    # Plot cost curve
    fig.add_trace(
        go.Scatter(
            x=w_array,
            y=cost,
            mode='lines',
            line=dict(color='blue', width=2),
            name='Cost curve',
            showlegend=False
        ),
        row=1, col=1
    )

    # Plot diverging path
    fig.add_trace(
        go.Scatter(
            x=x,
            y=v,
            mode='lines+markers',
            line=dict(color='magenta', width=2),
            marker=dict(size=6),
            name='Diverging path',
            showlegend=False
        ),
        row=1, col=1
    )

    # Right subplot: 3D surface with adaptive range
    tmp_b, tmp_w = np.meshgrid(
        np.arange(int(b_plot_min), int(b_plot_max), b_step),
        np.arange(int(w_plot_min), int(w_plot_max), w_step)
    )
    z = np.zeros_like(tmp_b, float)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i][j] = compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j])

    # Add surface
    fig.add_trace(
        go.Surface(
            x=tmp_w,
            y=tmp_b,
            z=z,
            colorscale='Viridis',
            opacity=0.7,
            showscale=False,
            name='Cost surface'
        ),
        row=1, col=2
    )

    # Add diverging path on 3D surface
    fig.add_trace(
        go.Scatter3d(
            x=x,
            y=y,
            z=v,
            mode='lines+markers',
            line=dict(color='magenta', width=4),
            marker=dict(size=4, color='magenta'),
            name='Diverging path',
            showlegend=False
        ),
        row=1, col=2
    )

    # Update axes
    fig.update_xaxes(title_text="w", title_font=dict(size=16), tickfont=dict(size=12), row=1, col=1)
    fig.update_yaxes(title_text="Cost", title_font=dict(size=16), tickfont=dict(size=12), row=1, col=1)

    # Update layout
    fig.update_layout(
        title_text="Cost escalates when learning rate is too large",
        title_font=dict(size=20),
        height=600,
        scene=dict(
            xaxis_title="w",
            yaxis_title="b",
            zaxis_title="Cost",
            xaxis=dict(title_font=dict(size=14)),
            yaxis=dict(title_font=dict(size=14)),
            zaxis=dict(title_font=dict(size=14)),
            camera=dict(
                eye=dict(x=1.5, y=-1.5, z=1.2)
            )
        )
    )

    return fig


def plotly_stationary_with_click(x_train, y_train):
    """
    Interactive version with click-like updates using ipywidgets sliders.
    Works reliably in all Jupyter environments without anywidget.

    Parameters:
    -----------
    x_train : array-like
        Training data features
    y_train : array-like
        Training data targets

    Returns:
    --------
    fig : plotly Figure or interactive widget
    None : placeholder for ax (compatibility)
    None : placeholder for dyn_items (compatibility)

    Usage:
    ------
    fig, _, _ = plotly_stationary_with_click(x_train, y_train)
    # Use the sliders to interactively update w and b values!
    """
    try:
        from ipywidgets import interact, FloatSlider
        use_widgets = True
    except ImportError:
        use_widgets = False
        print("Note: ipywidgets not available. Showing static plot.")
        print("Install with: pip install ipywidgets")

    # Setup useful ranges
    w_range = np.array([200-300., 200+300])
    b_range = np.array([50-300., 50+300])
    b_space = np.linspace(*b_range, 100)
    w_space = np.linspace(*w_range, 100)

    # Get cost for w,b ranges for contour and 3D
    tmp_b, tmp_w = np.meshgrid(b_space, w_space)
    z = np.zeros_like(tmp_b)
    for i in range(tmp_w.shape[0]):
        for j in range(tmp_w.shape[1]):
            z[i,j] = compute_cost(x_train, y_train, tmp_w[i][j], tmp_b[i][j])
            if z[i,j] == 0:
                z[i,j] = 1e-6

    if not use_widgets:
        # Return static version if ipywidgets not available
        fig, _, _ = plotly_stationary_interactive(x_train, y_train)
        return fig, None, None

    # Create interactive function with sliders
    @interact(
        w=FloatSlider(min=w_range[0], max=w_range[1], step=10, value=200, description='w:'),
        b=FloatSlider(min=b_range[0], max=b_range[1], step=10, value=-100, description='b:')
    )
    def update_plot(w=200, b=-100):
        f_wb = np.dot(x_train, w) + b

        # Create subplots
        fig = make_subplots(
            rows=1, cols=3,
            subplot_titles=('Housing Prices', 'Cost(w,b) - Contour', 'Cost(w,b) - 3D Surface'),
            specs=[[{'type': 'scatter'}, {'type': 'contour'}, {'type': 'surface'}]],
            horizontal_spacing=0.08,
            column_widths=[0.28, 0.36, 0.36]
        )

        # Left plot: Housing data with prediction
        fig.add_trace(
            go.Scatter(x=x_train, y=y_train, mode='markers',
                      marker=dict(symbol='x', size=10, color='red'),
                      name='Actual Value'),
            row=1, col=1
        )

        fig.add_trace(
            go.Scatter(x=x_train, y=f_wb, mode='lines',
                      line=dict(color='blue', width=2),
                      name='Our Prediction'),
            row=1, col=1
        )

        # Add cost lines
        cost_lines_x = []
        cost_lines_y = []
        for x_i, y_i in zip(x_train, y_train):
            f_wb_i = w * x_i + b
            cost_lines_x.extend([x_i, x_i, None])
            cost_lines_y.extend([y_i, f_wb_i, None])

        fig.add_trace(
            go.Scatter(x=cost_lines_x, y=cost_lines_y, mode='lines',
                      line=dict(color='purple', width=2, dash='dot'),
                      name='Cost',
                      showlegend=False),
            row=1, col=1
        )

        # Middle: Contour plot
        contour = go.Contour(
            x=w_space,
            y=b_space,
            z=np.log(z.T),
            colorscale='Viridis',
            contours=dict(
                start=np.log(z).min(),
                end=np.log(z).max(),
                size=(np.log(z).max() - np.log(z).min()) / 12
            ),
            name='Cost',
            showscale=False,
            hovertemplate='w: %{x:.1f}<br>b: %{y:.1f}<extra></extra>'
        )

        # Add crosshairs on contour
        fig.add_trace(
            go.Scatter(x=[w_range[0], w], y=[b, b], mode='lines',
                      line=dict(color='purple', width=2, dash='dot'),
                      showlegend=False, hoverinfo='skip'),
            row=1, col=2
        )

        fig.add_trace(
            go.Scatter(x=[w, w], y=[b_range[0], b], mode='lines',
                      line=dict(color='purple', width=2, dash='dot'),
                      showlegend=False, hoverinfo='skip'),
            row=1, col=2
        )

        fig.add_trace(contour, row=1, col=2)

        # Add current point marker on contour
        current_cost = compute_cost(x_train, y_train, w, b)
        marker_contour = go.Scatter(
            x=[w],
            y=[b],
            mode='markers+text',
            marker=dict(size=12, color='blue'),
            name='Current w,b',
            text=[f'Cost: {current_cost:.0f}'],
            textposition='top center',
            textfont=dict(size=10),
            showlegend=False
        )

        fig.add_trace(marker_contour, row=1, col=2)

        # Right: 3D surface plot
        surface = go.Surface(
            x=tmp_w,
            y=tmp_b,
            z=z,
            colorscale='Viridis',
            opacity=0.9,
            name='Cost Surface',
            showscale=True,
            colorbar=dict(x=1.02, len=0.75)
        )

        # Add current point marker on 3D surface
        marker_3d = go.Scatter3d(
            x=[w],
            y=[b],
            z=[current_cost],
            mode='markers',
            marker=dict(size=6, color='red', symbol='diamond'),
            name='Current Point',
            showlegend=False
        )

        fig.add_trace(surface, row=1, col=3)
        fig.add_trace(marker_3d, row=1, col=3)

        # Update axes
        fig.update_xaxes(title_text="Size (100 m²)", row=1, col=1)
        fig.update_yaxes(title_text="Price (1000s CHF)", row=1, col=1)
        fig.update_xaxes(title_text="w", row=1, col=2, range=w_range)
        fig.update_yaxes(title_text="b", row=1, col=2, range=b_range)

        # Update layout
        fig.update_layout(
            title_text=f"Interactive Cost Function - Current Cost: {current_cost:.0f}",
            showlegend=True,
            height=500,
            scene=dict(
                xaxis_title="w",
                yaxis_title="b",
                zaxis_title="J(w,b)",
                camera=dict(
                    eye=dict(x=1.5, y=-1.5, z=1.2)
                )
            )
        )

        fig.show()

    return None, None, None

