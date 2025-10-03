import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple
import requests
import re
def generate_compound_interest_data(principal: float = 1000.0, rate: float = 0.08, 
                                     noise_level: float = 0.15, num_points: int = 20) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate synthetic compound interest data with noise.
    
    Args:
        principal: Initial investment amount ($)
        rate: Annual interest rate (as decimal, e.g., 0.08 for 8%)
        noise_level: Standard deviation of noise as fraction of true value
        num_points: Number of data points
    
    Returns:
        t: array of time values (years)
        A_noisy: array of amounts with noise ($)
        A_true: array of true amounts ($)
    """
    t = np.linspace(0, 30, num_points)
    A_true = principal * np.exp(rate * t)
    
    # Add Gaussian noise
    noise = np.random.normal(0, noise_level * A_true)
    A_noisy = A_true + noise
    
    return t, A_noisy, A_true

def plot_introduction(t: np.ndarray, A_true: np.ndarray, principal: float, rate: float):
    """Display the true compound interest law."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
    
    ax1.plot(t, A_true, 'b-', linewidth=3, label=r'True Law: $A = P \cdot e^{rt}$')
    ax1.set_xlabel('Time t (years)', fontsize=12)
    ax1.set_ylabel('Amount A ($)', fontsize=12)
    ax1.set_title('The Compound Interest Law', fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend(fontsize=11)
    
    ax2.text(0.5, 0.6, r'$A = P \cdot e^{rt}$', 
             fontsize=28, ha='center', transform=ax2.transAxes,
             bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8))
    ax2.text(0.5, 0.35, f'Where:\nA = amount ($)\nt = time (years)\nP = {principal:.0f} (principal)\nr = {rate:.2f} (rate)',
             fontsize=12, ha='center', transform=ax2.transAxes)
    ax2.set_title('Goal: Discover this law from noisy data', fontsize=12, fontweight='bold')
    ax2.axis('off')
    
    plt.tight_layout()
    plt.show()

def plot_noisy_data(t: np.ndarray, A_noisy: np.ndarray):
    """Display the noisy experimental data."""
    plt.figure(figsize=(10, 6))
    plt.scatter(t, A_noisy, c='darkgreen', s=100, alpha=0.6, edgecolors='black', label='Measured Data')
    plt.xlabel('Time t (years)', fontsize=12)
    plt.ylabel('Amount A ($)', fontsize=12)
    plt.title('Investment Growth Data (with measurement noise)', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.legend(fontsize=11)
    plt.tight_layout()
    plt.show()

def plot_iteration(t: np.ndarray, A_noisy: np.ndarray, predictions: np.ndarray, 
                   equation: str, r_squared: float, iteration: int):
    """Plot the current hypothesis against data."""
    # Determine color based on fit quality
    if r_squared > 0.95:
        color = 'green'
    elif r_squared > 0.8:
        color = 'orange'
    else:
        color = 'red'
    
    plt.figure(figsize=(10, 6))
    plt.scatter(t, A_noisy, c='darkgreen', s=100, alpha=0.4, 
                edgecolors='black', label='Measured Data', zorder=3)
    plt.plot(t, predictions, color=color, linewidth=3, 
             label=f'Prediction: {equation}', zorder=2)
    
    plt.xlabel('Time t (years)', fontsize=12)
    plt.ylabel('Amount A ($)', fontsize=12)
    plt.title(f'Iteration {iteration} - R² = {r_squared:.4f}', 
              fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.legend(fontsize=11)
    plt.tight_layout()
    plt.show()

def evaluate_equation(equation_str: str, t: np.ndarray) -> np.ndarray:
    """
    Safely evaluate a mathematical equation.
    
    Args:
        equation_str: String equation like "1000 * exp(0.08 * t)" or "A = 1000 * e^(0.08*t)"
        t: Array of time values
        
    Returns:
        Array of predicted values
    """
    try:
        # Clean up the equation
        eq = equation_str.strip()
        
        # Replace mathematical notation FIRST (before stripping prefixes)
        eq = eq.replace('×', '*')  # Replace multiplication symbol
        eq = eq.replace('÷', '/')  # Replace division symbol
        eq = eq.replace('π', 'np.pi')
        eq = eq.replace('pi', 'np.pi')
        eq = eq.replace('^', '**')
        eq = eq.replace('e**', 'np.exp')  # e^x becomes np.exp(x)
        
        # Handle mathematical functions - must be done carefully to avoid replacing substrings
        eq = eq.replace('sqrt', 'np.sqrt')
        eq = eq.replace('arcsin', 'np.arcsin')
        eq = eq.replace('arccos', 'np.arccos')
        eq = eq.replace('arctan', 'np.arctan')
        eq = eq.replace('sinh', 'np.sinh')
        eq = eq.replace('cosh', 'np.cosh')
        eq = eq.replace('tanh', 'np.tanh')
        eq = eq.replace('sin', 'np.sin')
        eq = eq.replace('cos', 'np.cos')
        eq = eq.replace('tan', 'np.tan')
        eq = eq.replace('exp', 'np.exp')
        eq = eq.replace('ln', 'np.log')  # ln is natural log
        eq = eq.replace('log10', 'np.log10')
        eq = eq.replace('log2', 'np.log2')
        eq = eq.replace('log', 'np.log')  # Keep as last log replacement
        eq = eq.replace('abs', 'np.abs')
        eq = eq.replace('floor', 'np.floor')
        eq = eq.replace('ceil', 'np.ceil')
        
        # Remove 'A =' or 'A=' prefix if present
        if eq.startswith('A ='):
            eq = eq[3:].strip()
        elif eq.startswith('A='):
            eq = eq[2:].strip()
        
        # Create a safe namespace with numpy functions
        namespace = {
            't': t, 
            'np': np, 
            'e': np.e,  # Euler's number
            '__builtins__': {}
        }
        
        # Evaluate
        result = eval(eq, namespace)
        
        return np.array(result)
    except Exception as e:
        print(f"⚠️  Error evaluating equation '{equation_str}': {e}")
        return None

def calculate_r_squared(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate R² (coefficient of determination)."""
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    return 1 - (ss_res / ss_tot)

def call_claude(prompt: str, api_key: str, model: str) -> str:
    """Call Anthropic Claude API."""
    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": model,
            "max_tokens": 2000,
            "messages": [{"role": "user", "content": prompt}]
        }
    )
    
    if response.status_code == 200:
        return response.json()["content"][0]["text"]
    else:
        raise Exception(f"Claude API error: {response.status_code} - {response.text}")

def call_openai(prompt: str, api_key: str, model: str) -> str:
    """Call OpenAI API."""
    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_completion_tokens": 2000,
        }
    )
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")

def call_ollama(prompt: str, base_url: str, model: str) -> str:
    """Call local Ollama API."""
    response = requests.post(
        f"{base_url}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
        }
    )
    
    if response.status_code == 200:
        return response.json()["response"]
    else:
        raise Exception(f"Ollama API error: {response.status_code} - {response.text}")

def call_llm(prompt: str, config: Dict) -> str:
    """
    Call the configured LLM provider.
    
    Args:
        prompt: The prompt to send
        config: Configuration dictionary
        
    Returns:
        LLM response text
    """
    provider = config["provider"].lower()
    
    if provider == "claude":
        return call_claude(prompt, config["anthropic_api_key"], config["claude_model"])
    elif provider == "openai":
        return call_openai(prompt, config["openai_api_key"], config["openai_model"])
    elif provider == "ollama":
        return call_ollama(prompt, config["ollama_base_url"], config["ollama_model"])
    else:
        raise ValueError(f"Unknown provider: {provider}")

def display_summary(iterations: List[Dict], t: np.ndarray, 
                    A_noisy: np.ndarray, A_true: np.ndarray, principal: float, rate: float):
    """Display final summary of the discovery process."""
    print("\n" + "=" * 80)
    print("🎉 DISCOVERY COMPLETE!")
    print("=" * 80)
    print()
    
    print("📈 ITERATION SUMMARY:")
    print("-" * 80)
    for iter_data in iterations:
        print(f"Iteration {iter_data['iteration']}: {iter_data['equation']}")
        print(f"  R² = {iter_data['r_squared']:.4f}, Confidence = {iter_data['confidence']}")
    print("-" * 80)
    print()
    
    # Find best iteration (with valid predictions)
    valid_iterations = [it for it in iterations if it['predictions'] is not None]
    
    if not valid_iterations:
        print("❌ No valid equations were found. All attempts failed to evaluate.")
        return
    
    best_iter = max(valid_iterations, key=lambda x: x['r_squared'])
    print(f"🏆 BEST EQUATION: {best_iter['equation']}")
    print(f"   R² = {best_iter['r_squared']:.4f}")
    print()
    
    print(f"🎯 TRUE LAW: A = {principal:.0f} * exp({rate:.2f} * t)")
    print()
    
    # Final comparison plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    ax1.scatter(t, A_noisy, c='darkgreen', s=100, alpha=0.6, 
                edgecolors='black', label='Measured Data', zorder=3)
    ax1.plot(t, best_iter['predictions'], 'g-', linewidth=3, 
             label=f"Discovered: {best_iter['equation']}", zorder=2)
    ax1.plot(t, A_true, 'b--', linewidth=2, alpha=0.7,
             label='True Law', zorder=1)
    ax1.set_xlabel('Time t (years)', fontsize=12)
    ax1.set_ylabel('Amount A ($)', fontsize=12)
    ax1.set_title(f"Best Discovery (R² = {best_iter['r_squared']:.4f})", 
                  fontsize=14, fontweight='bold')
    ax1.grid(True, alpha=0.3)
    ax1.legend(fontsize=10)
    
    r_squared_values = [it['r_squared'] for it in valid_iterations]
    iteration_numbers = [it['iteration'] for it in valid_iterations]
    ax2.plot(iteration_numbers, r_squared_values, 
             'bo-', linewidth=2, markersize=10)
    ax2.set_xlabel('Iteration', fontsize=12)
    ax2.set_ylabel('R² Score', fontsize=12)
    ax2.set_title('Discovery Progress', fontsize=14, fontweight='bold')
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim([0, 1.05])
    
    plt.tight_layout()
    plt.show()

def parse_llm_response(response: str) -> Dict[str, str]:
    """
    Parse the LLM response into structured components.
    
    Args:
        response: Raw LLM response text
        
    Returns:
        Dictionary with 'reasoning', 'equation', and 'confidence'
    """
    reasoning_match = re.search(r'REASONING:(.*?)(?=EQUATION:|$)', response, re.DOTALL)
    equation_match = re.search(r'EQUATION:(.*?)(?=CONFIDENCE:|$)', response, re.DOTALL)
    confidence_match = re.search(r'CONFIDENCE:(.*?)$', response, re.DOTALL)
    
    return {
        'reasoning': reasoning_match.group(1).strip() if reasoning_match else response,
        'equation': equation_match.group(1).strip() if equation_match else "Unable to parse",
        'confidence': confidence_match.group(1).strip() if confidence_match else "Unknown"
    }



def build_prompt(t: np.ndarray, A: np.ndarray, iteration: int, previous_iterations: List[Dict], config: Dict) -> str:
    """
    Build the prompt for the LLM.
    
    Args:
        t: Array of time values
        A: Array of amounts
        iteration: Current iteration number
        previous_iterations: List of previous iteration results
        config: Configuration dictionary
        
    Returns:
        Formatted prompt string
    """
    # Format the data
    data_str = "\n".join([f"t={time:.1f}, A={amount:.2f}" for time, amount in zip(t, A)])
    
    prompt = f"""You are a scientific AI agent discovering mathematical laws from experimental data.

EXPERIMENTAL DATA:
{data_str}

IMPORTANT: Discover the relationship purely from the data patterns.
Think step-by-step: examine how A changes as t changes, look for linear, polynomial, exponential, or other relationships.

"""
    
    # Add previous attempts if any
    if previous_iterations:
        prompt += "PREVIOUS ATTEMPTS:\n"
        for prev in previous_iterations:
            prompt += f"Iteration {prev['iteration']}: {prev['equation']} (R²={prev['r_squared']:.4f})\n"
        prompt += "\n"
    
    prompt += f"""Your task for iteration {iteration}:
1. Analyze the relationship between t and A in the data
2. Propose a mathematical equation: A = [function of t]
3. Explain your reasoning - what patterns do you see?
4. Use mathematical notation
"""
    
    prompt += """
Respond in this EXACT format:
REASONING: [Your step-by-step analysis]
EQUATION: [Just the expression]
CONFIDENCE: [Low/Medium/High]
"""
    return prompt


def run_autonomous_discovery(t: np.ndarray, A_noisy: np.ndarray, config: Dict) -> List[Dict]:
    """
    Run the autonomous scientific discovery process.
    
    Args:
        t: Array of time values
        A_noisy: Array of measured amounts (with noise)
        config: Configuration dictionary
        
    Returns:
        List of iteration results
    """
    iterations = []
    
    print("=" * 80)
    print("STARTING AUTONOMOUS SCIENTIFIC DISCOVERY")
    print("=" * 80)
    print(f"Provider: {config['provider']}")
    if config['provider'] == 'claude':
        print(f"Model: {config['claude_model']}")
    elif config['provider'] == 'openai':
        print(f"Model: {config['openai_model']}")
    else:
        print(f"Model: {config['ollama_model']}")
    print(f"Max Iterations: {config['max_iterations']}")
    print("=" * 80)
    print()
    
    for i in range(1, config['max_iterations'] + 1):
        print(f"\n{'='*80}")
        print(f"ITERATION {i}")
        print(f"{'='*80}\n")
        
        # Build prompt
        prompt = build_prompt(t, A_noisy, i, iterations, config)
        
        print("📝 PROMPT SENT TO LLM:")
        print("-" * 80)
        print(prompt)
        print("-" * 80)
        print()
        
        # Call LLM
        print("🤔 Waiting for LLM response...")
        try:
            response = call_llm(prompt, config)
        except Exception as e:
            print(f"❌ Error calling LLM: {e}")
            continue
        
        print("\n🧠 LLM RESPONSE:")
        print("-" * 80)
        print(response)
        print("-" * 80)
        print()
        
        # Parse response
        parsed = parse_llm_response(response)
        
        print("📊 PARSED COMPONENTS:")
        print(f"Equation: {parsed['equation']}")
        print(f"Confidence: {parsed['confidence']}")
        print()
        
        # Evaluate equation
        predictions = evaluate_equation(parsed['equation'], t)
        
        if predictions is not None:
            r_squared = calculate_r_squared(A_noisy, predictions)
            print(f"✅ R² Score: {r_squared:.4f}")
            
            # Store iteration results
            iteration_data = {
                'iteration': i,
                'prompt': prompt,
                'response': response,
                'reasoning': parsed['reasoning'],
                'equation': parsed['equation'],
                'confidence': parsed['confidence'],
                'r_squared': r_squared,
                'predictions': predictions
            }
            iterations.append(iteration_data)
            
            # Plot results
            plot_iteration(t, A_noisy, predictions, parsed['equation'], r_squared, i)
            
            # Check if we've found a good solution
            if r_squared > 0.99:
                print("\n🎉 Excellent fit found! Discovery complete.")
                break
        else:
            print("❌ Could not evaluate equation")
            # Still store the iteration
            iteration_data = {
                'iteration': i,
                'prompt': prompt,
                'response': response,
                'reasoning': parsed['reasoning'],
                'equation': parsed['equation'],
                'confidence': parsed['confidence'],
                'r_squared': 0.0,
                'predictions': None
            }
            iterations.append(iteration_data)
    
    return iterations